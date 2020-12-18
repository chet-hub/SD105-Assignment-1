/**
 *  modal pop alert
 */
function pop(openFn, closeFn) {
    if (window['modal_pop'] === undefined) {
        const content = `
        <style>
            /* The Modal (background) */
            #aLongNameToAvoidConflictingFor_modal {
                display: none; /* Hidden by default */
                position: fixed; /* Stay in place */
                z-index: 1; /* Sit on top */
                padding-top: 100px; /* Location of the box */
                left: 0;
                top: 0;
                width: 100%; /* Full width */
                height: 100%; /* Full height */
                overflow: auto; /* Enable scroll if needed */
                background-color: rgb(0, 0, 0); /* Fallback color */
                background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
            }
            /* Modal Content */
            .aLongNameToAvoidConflictingFor_modal-content {
                background-color: #fefefe;
                margin: auto;
                padding: 20px;
                border: 1px solid #888;
                width: 80%;
            }
            /* The Close Button */
            .aLongNameToAvoidConflictingFor_close {
                color: #aaaaaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
            }
            .aLongNameToAvoidConflictingFor_close:hover,
            .aLongNameToAvoidConflictingFor_close:focus {
                color: #000;
                text-decoration: none;
                cursor: pointer;
            }
        </style>
        <div id="aLongNameToAvoidConflictingFor_modal">
            <div class="aLongNameToAvoidConflictingFor_modal-content">
            <span class="aLongNameToAvoidConflictingFor_close">&times;</span>
            <p></p>
            </div>
        </div>`
        document.body.insertAdjacentHTML("beforeend", content);
        const modal = document.getElementById("aLongNameToAvoidConflictingFor_modal");
        const span = document.getElementsByClassName("aLongNameToAvoidConflictingFor_close")[0];
        span.onclick = function () {
            modal.style.display = "none";
        }
        window['modal_pop'] = {
            open: function (message, timeout) {
                modal.querySelector('p').innerHTML = message
                modal.style.display = "block";
                if (timeout !== undefined && parseInt(timeout) !== NaN) {
                    setTimeout(function () {
                        if (openFn instanceof Function) openFn();
                        modal.style.display = "none";
                    }, timeout)
                } else {
                    if (openFn instanceof Function) openFn();
                }
            },
            close: function () {
                modal.style.display = "none";
                if (closeFn instanceof Function) closeFn()
            }
        }
    }
    return window['modal_pop'];
}


/**
 * searchStreetsByKeyword
 * @param keyword
 * @returns {Promise<* | [] | {streets: *[], "query-time": string}>}
 */
const searchStreetsByKeyword = function (keyword) {
    return fetch(`https://api.winnipegtransit.com/v3/streets:${keyword}.json?usage=long&api-key=Fci2OUg2KGq4iq3o66Q6`)
        .then(result => result.json())
        .then(function (data) {
            data["streets"] = (data["streets"] instanceof Array && data["streets"].length >= 1) ? data["streets"] : []
            return data["streets"]
        }).catch(function (err) {
            pop().open(`"Search streets by Keyword ${keyword} failed, please try again late."`, 1000)
        })
}

/**
 * searchStopsByStreetKey
 * @param streetKey
 * @returns {Promise<* | {stops, "query-time": string}>}
 */
const searchStopsByStreetKey = function (streetKey) {
    return fetch(`https://api.winnipegtransit.com/v3/stops.json?street=${streetKey}&usage=long&api-key=Fci2OUg2KGq4iq3o66Q6`)
        .then(result => result.json())
        .catch(function (err) {
            console.error(err)
            pop().open("Fail to search stops by street , please try again!")
        }).then(function (data) {
            data["stops"] = (data["stops"] instanceof Array && data["stops"].length >= 1) ? data["stops"] : []
            return data["stops"].reduce(function (context, stop) {
                context.push(stop.key)
                return context;
            }, [])
        })
}


/**
 * get Render Json From Api Json
 * @param data
 * eg:
 * {
 *     "stop-schedule": {
 *        "stop": {
 *             "key": 20320,
 *             "name": "Westbound Red River College at RRC (19 via Notre Dame)",
 *            "number": 20320,
 *            "direction": "Westbound",
 *            "side": "Nearside",
 *            "street": {"key": 50000265, "name": "Red River College", "type": "Terminal"},
 *            "cross-street": {"key": 961, "name": "Dalton Crescent", "type": "Crescent"},
 *            "centre": {
 *                "utm": {"zone": "14U", "x": 628340, "y": 5530991},
 *                "geographic": {"latitude": "49.91751", "longitude": "-97.21223"}
 *            }
 *        }, "route-schedules": [{
 *            "route": {
 *                "key": 19,
 *                "number": 19,
 *                "name": "Route 19 Marion-Logan-Notre Dame",
 *                "customer-type": "regular",
 *                "coverage": "regular",
 *                "badge-label": 19,
 *                "badge-style": {
 *                    "class-names": {"class-name": ["badge-label", "regular"]},
 *                    "background-color": "#ffffff",
 *                    "border-color": "#d9d9d9",
 *                    "color": "#000000"
 *                }
 *            },
 *            "scheduled-stops": [{
 *                "key": "16104576-1",
 *                "cancelled": "false",
 *                "times": {"departure": {"scheduled": "2020-12-18T08:48:00", "estimated": "2020-12-18T08:48:00"}},
 *                "variant": {"key": "19-1-A", "name": "Windsor Park via Autumnwood"},
 *                "bus": {"key": 152, "bike-rack": "false", "wifi": "false"}
 *            }, {
 *                "key": "16104577-1",
 *                "cancelled": "false",
 *                "times": {"departure": {"scheduled": "2020-12-18T09:11:00", "estimated": "2020-12-18T09:11:00"}},
 *                "variant": {"key": "19-1-A", "name": "Windsor Park via Autumnwood"},
 *                "bus": {"key": 334, "bike-rack": "false", "wifi": "false"}
 *            }]
 *        }]
 *    }, "query-time": "2020-12-18T08:40:20"
 * }
 * @returns string
 * eg:
 *  [{
 *      "busNumber": 19,
 *      "nextBus": "2020-12-18T08:48:00",
 *      "stopName": "Westbound Red River College at RRC (19 via Notre Dame)",
 *      "crossStreet": "Dalton Crescent",
 *      "direction": "Westbound"
 *  }, {
 *      "busNumber": 19,
 *      "nextBus": "2020-12-18T09:11:00",
 *      "stopName": "Westbound Red River College at RRC (19 via Notre Dame)",
 *      "crossStreet": "Dalton Crescent",
 *      "direction": "Westbound"
 *  }, {
 *      "busNumber": 19,
 *      "nextBus": "2020-12-18T09:48:00",
 *      "stopName": "Westbound Red River College at RRC (19 via Notre Dame)",
 *      "crossStreet": "Dalton Crescent",
 *      "direction": "Westbound"
 *  }, {
 *      "busNumber": 19,
 *      "nextBus": "2020-12-18T10:25:00",
 *      "stopName": "Westbound Red River College at RRC (19 via Notre Dame)",
 *      "crossStreet": "Dalton Crescent",
 *      "direction": "Westbound"
 *  }]
 *
 */
const getRenderJsonFromApiJson = function (data) {
    const result = {
        stopName: data['stop-schedule'].stop.name,
        crossStreet: data['stop-schedule'].stop['cross-street'].name,
        direction: data['stop-schedule'].stop.direction
    }
    let returnResult = [];
    data['stop-schedule']['route-schedules'].forEach(function (schedule) {
        const busNumber = schedule.route.number;
        schedule['scheduled-stops'].reduce(function (busArray, iterm) {
            const nextBus = iterm.times.departure.scheduled
            busArray.push({busNumber: busNumber, nextBus: nextBus})
            return busArray
        }, []).forEach(function (bus) {
            returnResult.push(Object.assign(bus, result))
        })
    })
    return returnResult;
}

/**
 * searchStopSchedulesByStopKey
 * @param stopKey
 * @returns {Promise<void | {"stop-schedule": {stop: {number: number, side: string, "cross-street": {name: string, type: string, key: number}, street: {name: string, type: string, key: number}, name: string, centre: {geographic: {latitude: string, longitude: string}, utm: {zone: string, x: number, y: number}}, key: number, direction: string}, "route-schedules": {route: {coverage: string, number: number, "customer-type": string, name: string, "badge-style": {"background-color": string, color: string, "class-names": {"class-name": string[]}, "border-color": string}, "badge-label": number, key: number}, "scheduled-stops"}[]}, "query-time": string}>}
 */
const searchStopSchedulesByStopKeyFromNow = function (stopKey) {
    return fetch(`https://api.winnipegtransit.com//v3/stops/${stopKey}/schedule.json?start=${new Date().toJSON()}&usage=long&api-key=Fci2OUg2KGq4iq3o66Q6`)
        .then(result => result.json())
        .catch(function (err) {
            console.error(err)
            pop().open("Fail to search stop schedules by stop, please try again!")
        }).then(getRenderJsonFromApiJson)
        .catch(() => {
            pop().open(`"Search stop schedules by stop failed, please try again late."`, 1000)
        })
}

/**
 * renderStreetList
 * @param streetArray
 */
const renderStreetList = function (streetArray) {
    if (streetArray != undefined && streetArray.length > 0) {
        pop().close()
        document.querySelector('.streets').innerHTML = streetArray.reduce(function (resultStr, street) {
            return resultStr += `<a href="#" data-street-key="${street.key}">${street.name}</a>`
        }, "")
    } else {
        pop().open("Can't find any street with the key word , please change the key word!", 1000)
    }
}

/**
 * Sort the list
 * @param a
 * @param b
 * @returns {number}
 */
const sortStopScheduleList = function (a, b) {
    if (a.busNumber === b.busNumber) {
        return a.nextBus.toString().localeCompare(b.nextBus.toString())
    } else {
        return a.busNumber.toString().localeCompare(b.busNumber.toString())
    }
}
/**
 * filter the bus information, just the keep the next 2 bus
 * @param value
 * @param index
 */
const showTheNext2Bus = function (value,index,array){
    if(index>=2 && value.busNumber === array[index-1].busNumber
        && value.busNumber === array[index-2].busNumber){
        return false;
    }else{
        return true;
    }
}

/**
 * render the schedule information to html
 * @param stopScheduleArray
 * eg:
 *      [
 *          {stopName:"Kenaston Boulevard"	crossStreet:"Rothwell Road"	 direction:"Northbound"	busNumber:"74"	nextBus:"02:25 PM"},
 *          {stopName:"Kenaston Boulevard"	crossStreet:"Southbound"	 direction:"Southbound"	busNumber:"74"	nextBus:"02:23 PM"}
 *      ]
 * @returns string
 * eg:   <tr>
 *          <td>Kenaston Boulevard</td>
 *          <td>Rothwell Road</td>
 *          <td>Northbound</td>
 *          <td>74</td>
 *          <td>02:25 PM</td>
 *       </tr>
 *       <tr>
 *          <td>Kenaston Boulevard</td>
 *          <td>Commerce Drive</td>
 *          <td>Southbound</td>
 *          <td>74</td>
 *          <td>02:23 PM</td>
 *       </tr>
 */
const renderStopScheduleList = function (stopScheduleArray, streetName) {
    if (stopScheduleArray.length == 0) {
        pop().open("Sorry, can't find any bus schedule information in this street", 1000)
    } else {
        pop().close()
        document.getElementById("street-name").innerHTML = streetName;
        const content = stopScheduleArray
            .sort(sortStopScheduleList)
            .filter(showTheNext2Bus)
            .reduce(function (resultStr, stopSchedule) {
                return resultStr += `<tr>
                    <td>${stopSchedule.stopName}</td>
                    <td>${stopSchedule.crossStreet}</td>
                    <td>${stopSchedule.direction}</td>
                    <td>${stopSchedule.busNumber}</td>
                    <td>${stopSchedule.nextBus}</td>
                </tr>`
            }, "")
        document.querySelector('tbody').innerHTML = content
    }
}


document.addEventListener('DOMContentLoaded', (event) => {

    //show street search result
    document.querySelector("form").addEventListener("submit", function (event) {
        event.preventDefault();
        const StreetSearchKeyword = event.target.children[0].value;
        if (StreetSearchKeyword != null && StreetSearchKeyword.trim() != "") {
            pop().open("loading...")
            searchStreetsByKeyword(StreetSearchKeyword).then(renderStreetList)
        }
    })

    //show bus stops result
    document.querySelector(".streets").addEventListener("click", function (event) {
        if (event.target.matches("a")) {
            pop().open("loading...")
            searchStopsByStreetKey(event.target.dataset['streetKey'])
                .then(function (stopIds) {
                    Promise.all(stopIds.map(searchStopSchedulesByStopKeyFromNow))
                        .catch(() => {
                            pop().open(`"Search stop schedules by stop failed, please try again late."`, 1000)
                        })
                        .then(function (result) {
                            renderStopScheduleList(result.flat(1), event.target.innerText)
                        })
                })
        }
    })
})