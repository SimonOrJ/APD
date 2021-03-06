const request = require('request');

const apiPreloaded = {};

var api, name = {
    match: {
        first: {},
        middle: {},
        last: {},
        full: {}
    },
    first: [],
    middle: [],
    last: []
};

// Download local data from API
request('https://theunitedstates.io/congress-legislators/legislators-current.json', function (e,r,b) {
    if (!e && r.statusCode == 200) {
        api = JSON.parse(b);
        
        for (var i = 0, l = api.length; i < l; i++) {
            // Full name
            var tname = api[i].name.official_full.toLowerCase();
            name.match.full[tname] = i;
            
            // Attempt to add to array. If no array exists, make a new array with a number in it.
            // Last name
            tname = api[i].name.last.toLowerCase();
            try {
                name.match.last[tname].push(i);
            } catch (e) {
                name.match.last[tname] = [i];
                name.last.push(tname);
            }
            
            // First name
            tname = api[i].name.first.toLowerCase();
            try {
                name.match.first[tname].push(i);
            } catch (e) {
                name.match.first[tname] = [i];
                name.first.push(tname);
            }
            
            // Middle name
            if (api[i].name.middle !== undefined) {
                tname = api[i].name.last.toLowerCase();
                try {
                    name.match.middle[tname].push(i);
                } catch (e) {
                    name.match.middle[tname] = [i];
                    name.middle.push(tname);
                }
            }
        }
        name.first.sort();
        name.middle.sort();
        name.last.sort();
    }
});

module.exports = apiPreloaded;

apiPreloaded.getBioguideFromIndex = function(index) {
    return api[index].id.bioguide;
};

apiPreloaded.getFullNameFromIndex = function(index) {
    return api[index].name.official_full;
};

apiPreloaded.getIndexFromFullName = function(fname) {
    return name.match.full[fname.toLowerCase()];
};

apiPreloaded.getCandidatesFromPartial = function(query) {
    var partial = query.toLowerCase(),
        candidate = [];
    // by Last Name
    for (var i = 0; i < name.last.length; i++) {
        if (name.last[i].substring(0, partial.length) === partial) {
            var list = name.match.last[name.last[i]]
            for (var j = 0; j < list.length; j++)
                candidate.push([this.getFullNameFromIndex(list[j]), this.getBioguideFromIndex(list[j])]);
        };
    }
    // by First Name
    for (var i = 0; i < name.first.length; i++) {
        if (name.first[i].substring(0, partial.length) === partial) {
            var list = name.match.first[name.first[i]]
            for (var j = 0; j < list.length; j++)
                candidate.push([this.getFullNameFromIndex(list[j]), this.getBioguideFromIndex(list[j])]);
        };
    }
    // by Middle Name
    for (var i = 0; i < name.middle.length; i++) {
        if (name.middle[i].substring(0, partial.length) === partial) {
            var list = name.match.middle[name.middle[i]]
            for (var j = 0; j < list.length; j++)
                candidate.push([this.getFullNameFromIndex(list[j]), this.getBioguideFromIndex(list[j])]);
        };
    }
    
    return candidate;
};

// In case anyone want to explore this API:
apiPreloaded.getFullDataFromIndex = function(index) {
    return api[index];
};
