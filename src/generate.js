import $ from 'jquery';
import _random from 'lodash.random';

export const random = (width, height) => {

    const raw = newMaze(width, height);
    const objecty = raw.map(row => {
        return row.map(cellArray => {
            //             The generated maze is defined by a multidimensional array consisting of y and x coordinates,
            // followed by definitions for the borders of each selected cell. The borders are defined using CSS order,
            // which is [top, right, left, bottom], where 0 defines the presence of a wall, and 1 defines no wall.

            // So if the first cell in the maze is defined as maze[0][0][0,1,1,0], there would be a wall on 
            //the top and the left of that particular cell, with openings on the right and bottom.
            return {
                top: !cellArray[0],
                right: !cellArray[1],
                bottom: !cellArray[2],
                left: !cellArray[3]
            };
        });
    });

    const result = [];
    objecty.forEach((row, index) => {
        let rowResult1 = [];
        let rowResult2 = [];
        let rowResult3 = [];
        let rowResult4 = [];
        row.forEach((cell, idx) => {
            var l = cell.left ? 1 : 0;
            var t = cell.top ? 1 : 0;
            var tl = 0;
            // if the guy above me is left
            // and the guy to the left is top
            // then my top left need to be there
            const guyAbove = objecty[index - 1] && objecty[index - 1][idx];
            const guyLeft = objecty[index][idx - 1];

            if ((guyAbove && guyAbove.left) || (guyLeft && guyLeft.top)) {
                tl = 1;
            }
            rowResult1 = [...rowResult1, t || l || tl, t, t];
            rowResult2 = [...rowResult2, l, 0, 0];
            rowResult3 = [...rowResult3, l, 0, 0];
        });
        result.push(rowResult1);
        result.push(rowResult2);
        result.push(rowResult3);
    });

    let playerStart = _random(0, 3);
    let goalStart = _random(0, 3);
    while (goalStart === playerStart) {
        goalStart = _random(0, 3);
    };

    // TOP LEFT
    // result[1][1] = 2; // player
    // TOP RIGHT
    //result[1][result[1].length -2] = 2; // player
    // bottom right
    //result[result.length - 2][result[1].length -2] = 2; // player
    // bottom left
    switch (goalStart) {
        case 0:
            result[1][1] = 4;
            break;
        case 1:
            result[1][result[1].length - 2] = 4;
            break;
        case 2:
            result[result.length - 2][1] = 4;
            break;
        case 3:
            result[result.length - 2][result[1].length - 2] = 4;
            break;
        default:
            throw new Error('fuck ' + goalStart);
    }

    switch (playerStart) {
        case 0:
            result[1][1] = 2;
            break;
        case 1:
            result[1][result[1].length - 2] = 2;
            break;
        case 2:
            result[result.length - 2][1] = 2;
            break;
        case 3:
            result[result.length - 2][result[1].length - 2] = 2;
            break;
    }

    var disp = raw;
    if (window.location.search.indexOf('map') !== -1) {
        $('#maze > tbody').empty();
        for (var i = 0; i < disp.length; i++) {
            $('#maze > tbody').append("<tr>");
            for (var j = 0; j < disp[i].length; j++) {
                var selector = i + "-" + j;
                $('#maze > tbody').append("<td id='" + selector + "'>&nbsp;</td>");
                if (disp[i][j][0] == 0) { $('#' + selector).css('border-top', '2px solid black'); }
                if (disp[i][j][1] == 0) { $('#' + selector).css('border-right', '2px solid black'); }
                if (disp[i][j][2] == 0) { $('#' + selector).css('border-bottom', '2px solid black'); }
                if (disp[i][j][3] == 0) { $('#' + selector).css('border-left', '2px solid black'); }
            }
            $('#maze > tbody').append("</tr>");
        }
    }
    return result;
};

function newMaze(x, y) {

    // Establish variables and starting grid
    var totalCells = x * y;
    var cells = new Array();
    var unvis = new Array();
    for (var i = 0; i < y; i++) {
        cells[i] = new Array();
        unvis[i] = new Array();
        for (var j = 0; j < x; j++) {
            cells[i][j] = [0, 0, 0, 0];
            unvis[i][j] = true;
        }
    }

    // Set a random position to start from
    var currentCell = [Math.floor(Math.random() * y), Math.floor(Math.random() * x)];
    var path = [currentCell];
    unvis[currentCell[0]][currentCell[1]] = false;
    var visited = 1;

    // Loop through all available cell positions
    while (visited < totalCells) {
        // Determine neighboring cells
        var pot = [[currentCell[0] - 1, currentCell[1], 0, 2],
        [currentCell[0], currentCell[1] + 1, 1, 3],
        [currentCell[0] + 1, currentCell[1], 2, 0],
        [currentCell[0], currentCell[1] - 1, 3, 1]];
        var neighbors = new Array();

        // Determine if each neighboring cell is in game grid, and whether it has already been checked
        for (var l = 0; l < 4; l++) {
            if (pot[l][0] > -1 && pot[l][0] < y && pot[l][1] > -1 && pot[l][1] < x && unvis[pot[l][0]][pot[l][1]]) { neighbors.push(pot[l]); }
        }

        // If at least one active neighboring cell has been found
        if (neighbors.length) {
            // Choose one of the neighbors at random
            let next = neighbors[Math.floor(Math.random() * neighbors.length)];

            // Remove the wall between the current cell and the chosen neighboring cell
            cells[currentCell[0]][currentCell[1]][next[2]] = 1;
            cells[next[0]][next[1]][next[3]] = 1;

            // Mark the neighbor as visited, and set it as the current cell
            unvis[next[0]][next[1]] = false;
            visited++;
            currentCell = [next[0], next[1]];
            path.push(currentCell);
        }
        // Otherwise go back up a step and keep going
        else {
            currentCell = path.pop();
        }
    }
    return cells;
}

