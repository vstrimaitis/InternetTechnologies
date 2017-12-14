var addresses = [
    "Saltoniškių g. 12, Vilnius",
    "Didlaukio g. 47, Vilnius",
    "Kalvarijų g. 98, Vilnius"
];

var url = "https://postit.lt/data/?term=";

function fetchData(address) {
    console.log("Fetching "+address);
    return fetch(url+address.replace(' ', '+'))
            .then(resp => resp.json())
            .then(resp => resp.data);
}

function outputList(results) {
    firstResults = results.map(x => x[0]);
    firstResults.sort((x, y) => x.post_code.localeCompare(y.post_code));
    console.log(firstResults);
    firstResults.forEach(x => {
        var item = $('<li>'+x.address + ' LT'+ x.post_code +'</li>');
        $('#answer').append(item);
    });
}

$(document).ready(function() {
    $('#doItBtn').click(() => {
        $('#answer').html('');
        Promise.all(addresses.map(fetchData))
            .then(outputList)
            .catch(err => console.error("Failed: "+err));
    })
});