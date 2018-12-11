window.onload = ()=>{
	let c = document.getElementById("c"), g = c.getContext("2d");
	g.fillStyle = "black";

    var shelves;
    let SCALE = 2.8,
        COLORS = ["128, 255, 255", "255, 128, 255", "255, 255, 128", "255, 168, 48"],
        ITEM_FILLSTYLE = "rgba(0,0,0,0.5)",
        ALPHA = 0.24,
        SHELF_COUNTS = [4, 5, 3, 1];
    
    function bindFileInput(id, f) {
        document.getElementById(id).addEventListener("change", (e)=>{
            let file = e.target.files[0];
            if (!file) return;
            let reader = new FileReader();
            reader.onload = function(e) {
                contents = e.target.result;
                f(contents);
            };
            reader.readAsText(file);
        });
    }
    bindFileInput("shelves", prepShelves);
    bindFileInput("model", prepItems);


    function prepItems(content) {
        let lines = content.split("\n").map(line => line.split("\t"));
        for(let idx = 0; idx < 42; idx++) {
            let line = lines[idx >= 3 ? idx - 3: idx];
            if(line.length <= 3) continue;
            let items = [];
            for(let i = 2; i < line.length - 1; i+=3) {
                items.push({width: parseInt(line[i+1]), height: parseInt(line[i+2])});
            }
            let shelf = shelves[parseInt(line[0] - 1)];
            shelf.items = shelf.items || [];
            shelf.items.push(items);
        }
        draw();
    }

    function prepShelves(content) {
        let lines = content.split("\n");
        const keys = ["dist", "width", "height", "component"];
        shelves = lines.map(line => line.replace(" x ", "\t").split("\t"));
        shelves.shift();
        //shelves = lines.map(line => line.replace(" x ", "\t").split("\t").reduce((acc, el, i)=>{acc[keys[i]]=el;return acc;}));
        let shelfObjects = [];
        for(idx in shelves) {
            shelf = shelves[idx];
            let obj = {
                dist: shelf[0],
                width: parseInt(shelf[1]),
                height: parseInt(shelf[2]),
                component: parseInt(shelf[3])
            };
            if(idx == 0) obj.height *= 2;
            shelfObjects.push(obj);
        }
        shelves = shelfObjects;
    }

    function line(x, y, x2, y2) {
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x2, y2);
        g.stroke();
    }

    function drawShelf(shelf) {
        if(!shelf.items) return;
        for(let subshelfIndex = 0; subshelfIndex < shelf.items.length; subshelfIndex++) {
            let subshelfItems = shelf.items[subshelfIndex];
            let x=0;
            for(let i = 0; i < subshelfItems.length; i++) {
                let item = subshelfItems[i];
                g.beginPath();
                let y = Math.min(shelf.height / 2, shelf.height - item.height);
                g.rect(x, subshelfIndex == 0 ? y : 0, item.width, item.height);
                x += item.width;
                g.fillStyle = ITEM_FILLSTYLE;
                g.fill();
                g.stroke();
            }
        }
    }

    function draw() {
        g.font="20px Times New Roman";
        let shelfDistance = 2, xOffset = 40, yRow = c.height / 3.0, yCur = 0, shelfCount = -1, lastComp = -1;
        line(0, yRow, c.width, yRow);
        line(0, 2 * yRow, c.width, 2 * yRow);
        for(let i =0; i <= shelfDistance; i++) {
            g.fillText("Distance = " + (2-i), 10, i * yRow + 20);
        }
        for(let idx = 0; idx < shelves.length; idx++) {
            shelf = shelves[idx];
            if(shelf.dist != shelfDistance) {
                xOffset = 40;
                shelfDistance = shelf.dist;
                yCur = (2 - shelfDistance) * yRow;
            }
            if(lastComp != shelf.component) {
                shelfCount = -1;
                lastComp = shelf.component;
            }
            shelfCount++;
            g.beginPath();
            g.rect(xOffset, yCur + 40, SCALE * shelf.width, SCALE * shelf.height);
            g.stroke();
            g.fillStyle = 'rgba(' + COLORS[shelf.component] + ', ' + ALPHA + ')';
            g.fill();
            g.save();
            g.translate(xOffset, yCur + 40 + SCALE * shelf.height);
            g.scale(SCALE, -SCALE);
            drawShelf(shelf);
            g.restore();
            g.fillStyle = "red";
            g.fillText("Shelf " + String.fromCharCode(65 + shelf.component) + shelfCount, xOffset, yCur + 60);
            xOffset += SCALE * shelf.width + 40;
            if(idx == shelves.length - 1 || xOffset > 1200) {
                xOffset = 40;
                yCur += yRow *0.37;
            }
        }
    }
}