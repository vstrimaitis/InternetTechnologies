var GAME_LIST_URL = "http://api.myjson.com/bins/zctff"
var SAVE_DATA_URL = "http://api.myjson.com/bins"

$(document).ready(() => {
    var formHelper = new FormHelper({
        form: "#createForm",
        rowsField: "#rowsField",
        colsField: "#colsField",
        coordsButton: "#coordsButton",
        wordCountField: "#wordCountField",
        submitButton: "#submitButton",
        gridArea: "#gridArea",
        wordArea: "#wordArea"
    });

    var validator = new Validator();

    fillGamesTable();
    
    $("#menuToggleBtn").click(() => {
        $("#menu #links").toggle();
        var elem = $("#menuToggleBtn");
        if(elem.text() == "Hide") elem.text("Show");
        else elem.text("Hide");
    });

    $('#dobField').on('keyup blur', e => {
        var str = e.target.value;
        formHelper.updateSubmitButton(validator.isValidDate(str));
    });

    // Apply event handler for dynamically created elements
    $('body').on('keyup blur', "input.numberField", e => {
        e.target.value = validator.validateNumber(e.target.value);
    });

    $('#rowsField, #colsField').on('keyup blur', e => {
        e.target.value = validator.validateNumber(e.target.value);
        formHelper.unfreezeCoords();
    });

    $('input.nonEmpty').on('keyup blur', e => {
        formHelper.updateSubmitButton(e.target.value.length > 0);
    });

    $('#wordCountField').on('keyup blur', e => {
        e.target.value = validator.validateNumber(e.target.value);
        formHelper.unfreezeWordCount();
    });

    $("#coordsButton").click(() => {
        var r = parseInt($("#rowsField").val());
        var c = parseInt($('#colsField').val());
        var grid = formHelper.generateGrid(r, c);
        $('#gridArea').html(grid);
    });

    $('#wordsButton').click(() => {
        var cnt = parseInt($('#wordCountField').val());
        var table = formHelper.generateWordsList(cnt);
        $('#wordArea').html(table);
    });

    $('body').on('keyup blur', 'input.gridInput, input.wordInput', e => {
        e.target.value = validator.validateText(e.target.value);
    });

    $('body').on('keyup blur', 'input.r', e => {
        if (formHelper.isGridEmpty()){
            e.target.value = "";
            return;
        }
        e.target.value = validator.validateRange(
            parseInt(e.target.value),
            0, parseInt($('#rowsField').val()));
    })

    $('body').on('keyup blur', 'input.c', e => {
        if (formHelper.isGridEmpty()){
            e.target.value = "";
            return;
        }
        e.target.value = validator.validateRange(
            parseInt(e.target.value),
            0, parseInt($('#colsField').val()));
    });
    
    $('#createForm').submit(e => {
        e.preventDefault();
        var data = formHelper.collectData();
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
        fetchGame(url)
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

    function fetchGame(url) {
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
            author: data.autho.name
        }
    }
});