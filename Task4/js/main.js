var GAME_LIST_URL = "http://api.myjson.com/bins/zctff"
var SAVE_DATA_URL = "http://api.myjson.com/bins"

Date.isValid = function(str) {
	var parts = str.split('-');
    if(parts.length !== 3) return null;
    
    var year = parseInt(parts[0]);
    var month = parseInt(parts[1])-1;
    var day = parseInt(parts[2]);
	
    var d = new Date(year, month, day);
    return /^\d+-\d+-\d+$/.test(str) && d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
}

Array.prototype.flatMap = function(lambda) { 
    return Array.prototype.concat.apply([], this.map(lambda)); 
};

$(document).ready(function () {
    fillGamesTable();
    
    $("#menuToggleBtn").click(function () {
        $("#menu #links").toggle();
        var elem = $("#menuToggleBtn");
        if(elem.text() == "Hide") elem.text("Show");
        else elem.text("Hide");
    });

    $('#dobField').on('keyup blur', function() {
        var str = this.value;
        updateSubmitButton(Date.isValid(str));
    });

    // Apply event handler for dynamically created elements
    $('body').on('keyup blur', "input.numberField", function () {
        validateNumberField(this);
    });

    $('#rowsField, #colsField').on('keyup blur', function() {
        validateNumberField(this);
        unfreezeCoords();
    });

    $('input.nonEmpty').on('keyup blur', function() {
        updateSubmitButton(this.value.length > 0);
    });

    $('#wordCountField').on('keyup blur', function() {
        validateNumberField(this);
        unfreezeWordCount();
    });

    $("#coordsButton").click(function () {
        var r = parseInt($("#rowsField").val());
        var c = parseInt($('#colsField').val());
        var grid = generateGrid(r, c);
        $('#gridArea').html(grid);
    });

    $('#wordsButton').click(function() {
        var cnt = parseInt($('#wordCountField').val());
        var table = generateWordsList(cnt);
        $('#wordArea').html(table);
    });

    $('body').on('keyup blur', 'input.gridInput, input.wordInput', function() {
        validateText(this);
        this.value = this.value.toUpperCase();
    });

    $('body').on('keyup blur', 'input.r', function() {
        validateRow(this);
    })

    $('body').on('keyup blur', 'input.c', function() {
        validateCol(this);
    });
    
    $('#createForm').submit(function(e) {
        e.preventDefault();
        var inputs = $('#createForm :input');
        var form = $('#createForm');
        var gameName = form.find('input[name="gameName"]').val();
        var name = form.find('input[name="name"]').val();
        var date = form.find('input[name="dob"]').val();
        var color = form.find('input[name="color"]').val();
        var r = parseInt(form.find('input[name="rows"]').val());
        var c = parseInt(form.find('input[name="cols"]').val());
        var wordCount = parseInt(form.find('input[name="wordCount"]').val());
        var words = [];
        var gridRows = $('#gridArea table tr');
        var grid = gridRows.toArray().slice(1).map(
                        x => $(x).find("td").toArray().slice(1).map(
                            y => $(y).find("input").toArray()[0].value
                        )
                    );
        var wordArea = $('#wordArea table tr');
        var inputWords = wordArea.toArray().slice(1).map(
            x => $(x).find("td").toArray().flatMap(y => $(y).find("input").toArray())
        ).map(
            (x, i) => {return {
                id: i,
                word: x[0].value,
                start: {
                    row: parseInt(x[1].value),
                    col: parseInt(x[2].value)
                },
                end: {
                    row: parseInt(x[3].value),
                    col: parseInt(x[4].value)
                }
            }}
        );

        var words = inputWords.map(x => x.word);
        var solution = inputWords.map(x => {
            var clone = Object.assign({}, x);
            delete clone.word;
            return clone;
        });
        var data = {
            timestamp: Date.now(),
            author: {
                name: name,
                dob: date,
                favColor: color,
            },
            game: {
                name: gameName,
                width: c,
                height: r,
                grid: grid,
                words: words,
                solution: solution
            }
        };
        saveData(data);
    });
    

    function buildGamesListItem(data, index) {
        var row = $('<tr>');
        var playBtn = $("<button>Play</button>");
        playBtn.click(() => launchGame(data.uri));
        row.append($('<td>'+data.author+'</td>'));
        row.append($('<td>'+data.name+'</td>'));
        var playCol = $('<td>');
        playCol.append(playBtn);
        row.append(playCol);
        return row;
    }
    function fillGamesTable(arr) {
        var table = $('#gamesTable tbody');
        table.html('');
        if(arr) {
            processGameList(arr, table);
        }
        else {
            fetchGameList()
                .then(r => processGameList(r, table))
                .catch(err => console.log("ERR", err));
        }
    }

    function launchGame(url) {
        fetchSingleGame(url)
            .then(showGame)
            .catch(err => console.log("ERR", err));
    }

    function showGame(data) {
        $('#menu').css('background-color', data.author.favColor);
        $('#game *').remove();
        var gameSection = $('#game');
        gameSection.append($('<h2>Currently playing "'+data.game.name+'" by '+data.author.name+'</h2>'));
        gameSection.append(makeGameTable(data));
        gameSection.append(makeWordsList(data));
    }

    function makeGameTable(data) {
        var table = $('<table class="gameTable">');
        data.game.grid.map(
            x => $('<tr>').append(x.map(
                y => $('<td>'+y+'</td>')
            ))
        ).forEach(x => table.append(x));
        return table;
    }

    function makeWordsList(data) {
        var list = $('<ul>');
        data.game.words.forEach(w => list.append($('<li>'+w+'</li>')));
        return list;
    }

    function processGameList(list, parent) {
        list.games.map(buildGamesListItem).forEach(i => parent.append(i))
    }

    function saveData(data) {
        Promise.all([uploadSingleGame(data), fetchGameList()])
            .then(([response, list]) => updateGameList(list.games.concat([buildGameReference(response.uri, data)])))
            .then(fillGamesTable)
            .catch(err => console.log("ERR!", err));
    }

    function uploadSingleGame(data) {
        return $.ajax({
            url: SAVE_DATA_URL,
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    }

    function updateGameList(refs) {
        return $.ajax({
            url: GAME_LIST_URL,
            type: "PUT",
            data: JSON.stringify({games: refs}),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    }

    function fetchSingleGame(url) {
        return $.ajax({
            url: url,
            type: "GET"
        })
    }

    function fetchGameList() {
        return $.ajax({
            url: GAME_LIST_URL,
            type: "GET"
        });
    }

    function buildGameReference(uri, data) {
        return {
            uri: uri,
            name: data.game.name,
            author: {
                name: data.author.name,
                favColor: data.author.favColor
            }
        }
    }

    function updateSubmitButton(isActive) {
        $('#submitButton').prop('disabled', !isActive);
    }
    function generateWordsList(cnt) {
        var table = $('<table></table>');
        var thead = $('<thead></thead>');
        var firstRow = $('<tr></tr>');
        firstRow.append($('<th>Word</th>'));
        firstRow.append($('<th>Start</th>'));
        firstRow.append($('<th>End</th>'));
        table.append(firstRow);
        for(var i = 0; i < cnt; i++) {
            var row = $('<tr></tr>');
            row.append($('<td><input type="text" class="wordInput" placeholder="WORD" required/></td>'));
            row.append($('<td>(<input type="text" class="numberField startR r" maxlength="2" placeholder="r" required />, <input type="text" class="numberField startC c" maxlength="2" placeholder="c" required />)</td>'));
            row.append($('<td>(<input type="text" class="numberField endR r" maxlength="2" placeholder="r" required />, <input type="text" class="numberField endC c" maxlength="2" placeholder="c" required />)</td>'));
            table.append(row);
        }
        return table;
    }

    function generateGrid(r, c) {
        var table = $('<table></table>');
        var firstRow = $('<tr></tr>');
        firstRow.append($('<td></td>'));
        for(var j = 0; j < c; j++) {
            firstRow.append($('<td>'+j+'</td>'));
        }
        table.append(firstRow);
        for(var i = 0; i < r; i++) {
            var row = $('<tr></tr>');
            row.append($('<td>'+ i +'</td>'))
            for(var j = 0; j < c; j++) {
                var col = $('<td></td>');
                col.append(createGridInput(i, j));
                row.append(col);
            }
            table.append(row);
        }
        return table;
    }

    function createGridInput(i, j) {
        var input = $('<input type="text" class="gridInput" maxlength="1" name="grid[]" placeholder="A" required></input>');
        return input;
    }
    
    function unfreezeCoords() {
        var r = $("#rowsField").val();
        var c = $('#colsField').val();
        if(r && c) {
            $('#coordsButton').prop('disabled', false);
        } else {
            $('#coordsButton').prop('disabled', true);
        }
    }

    function unfreezeWordCount() {
        var cnt = $("#wordCountField").val();
        if(cnt && cnt) {
            $('#wordsButton').prop('disabled', false);
        } else {
            $('#wordsButton').prop('disabled', true);
        }
    }

    function validateNumberField(f) {
        if (/\D/g.test(f.value)) {
            f.value = f.value.replace(/\D/g, '');
        }
    }

    function validateText(f) {
        if(/[^a-zA-Z]+/g.test(f.value)) {
            f.value = f.value.replace(/[^a-zA-Z]/g, '');
        }
    }

    function validateRow(f) {
        var R = parseInt($("#rowsField").val());
        var r = parseInt(f.value);
        var grid = $('#gridArea').html();
        if(!grid || r < 0 || r >= R) f.value = "";
    }

    function validateCol(f) {
        var C = parseInt($("#colsField").val());
        var c = parseInt(f.value);
        var grid = $('#gridArea').html();
        if(!grid || c < 0 || c >= C) f.value = "";
    }
});