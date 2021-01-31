local = {
    set : function(key, value) {
        localStorage.setItem(key, JSON.stringify(value))
    },
    get : function(key) {
        return JSON.parse(localStorage.getItem(key));
    }
}

function writeInRating(isWin){
    let plusrating = isWin ? (countGoodBall * player.health * player.height) :
                        (0 - (countGoodBall / speed));
    plusrating = Math.trunc(plusrating);
    let rating = local.get(player.name);
    if(rating){
        local.set(player.name, rating + plusrating);
    } else {
        local.set(player.name, plusrating);
    }
}

function updateRatingTable() {
    $("#ratingTable").html(function(){
        let table = ["<caption>RatingTable</caption>"];
        let tableForRating = [];
        for(let i = 0; i < localStorage.length; i++){
            let key = localStorage.key(i);
            let value = local.get(key);
            tableForRating.push(value);
        }

        tableForRating.sort(function(a, b) {
            if (a < b) return 1;
            if (a == b) return 0;
            if (a > b) return -1;
        });

        tableForRating.forEach(function(number) {
            for(let i = 0; i < localStorage.length; i++){
                let key = localStorage.key(i);
                let value = local.get(key);
                if(value === number)
                    table.push('<tr><td class="value">' + key + '</td><td>' + value + '</td></tr>');
            }
        });
        return table.join();
    });
}