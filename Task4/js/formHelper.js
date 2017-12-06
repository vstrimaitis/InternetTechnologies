function FormHelper(selectors) {
    this.selectors = selectors;
}

FormHelper.prototype.generateWordsList = function (cnt) {
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
FormHelper.prototype.generateGrid = function (r, c) {
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
            col.append(this.createGridInput(i, j));
            row.append(col);
        }
        table.append(row);
    }
    return table;
}

FormHelper.prototype.createGridInput = function (i, j) {
    var input = $('<input type="text" class="gridInput" maxlength="1" name="grid[]" placeholder="A" required></input>');
    return input;
}

FormHelper.prototype.unfreezeCoords = function () {
    var r = $(this.selectors.rowsField).val();
    var c = $(this.selectors.colsField).val();
    if(r && c) {
        $(this.selectors.coordsButton).prop('disabled', false);
    } else {
        $(this.selectors.coordsButton).prop('disabled', true);
    }
}

FormHelper.prototype.unfreezeWordCount = function () {
    var cnt = $(this.selectors.wordCountField).val();
    if(cnt && cnt) {
        $(this.selectors.wordsButton).prop('disabled', false);
    } else {
        $(this.selectors.wordsButton).prop('disabled', true);
    }
}

FormHelper.prototype.updateSubmitButton = function (isActive) {
    $(this.selectors.submitButton).prop('disabled', !isActive);
}

FormHelper.prototype.isGridEmpty = function() {
    var grid = $(this.selectors.gridArea).html();
    return !grid;
}

FormHelper.prototype.collectData = function () {
    var inputs = $(this.selectors.form+' :input');
    var form = $(this.selectors.form);
    var gameName = form.find('input[name="gameName"]').val();
    var name = form.find('input[name="name"]').val();
    var date = form.find('input[name="dob"]').val();
    var color = form.find('input[name="color"]').val();
    var r = parseInt(form.find('input[name="rows"]').val());
    var c = parseInt(form.find('input[name="cols"]').val());
    var wordCount = parseInt(form.find('input[name="wordCount"]').val());
    var words = [];
    var gridRows = $(this.selectors.gridArea + ' table tr');
    var grid = gridRows.toArray().slice(1).map(
                    x => $(x).find("td").toArray().slice(1).map(
                        y => $(y).find("input").toArray()[0].value
                    )
                );
    var wordArea = $(this.selectors.wordArea + ' table tr');
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
    return data;
}

Array.prototype.flatMap = lambda => { 
    return Array.prototype.concat.apply([], this.map(lambda)); 
}