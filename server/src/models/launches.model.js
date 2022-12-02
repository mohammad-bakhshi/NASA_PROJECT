const axios = require('axios');

const launches = require('./launches.mongo');
const planets = require('./planets.mongo')


async function existsLaunchWithId(launchId) {
    return await findLaunch({ flightNumber: launchId });
}


async function getLatestFlightNumber() {
    const launch = await launches.findOne().sort('-flightNumber');
    if (launch) {
        return launch.flightNumber;
    }
    return 100;
}

async function getAllLaunches(skip, limit) {
    return await launches.find({}, { _id: 0, __v: 0 })
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit);
}

async function saveLaunch(launch) {

    await launches.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch,
        {
            upsert: true
        })
}


const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches() {
    console.log('Downloading launch data');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });


    console.log('Downloading launch data2');

    if (response.status !== 200) {
        throw new Error('Launch data download failed')
    }

    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads']
        const customers = payloads.flatMap((payload) => {
            return payload['customers']
        })
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: customers
        }
        console.log(launch.flightNumber)
        await saveLaunch(launch);
    }
}

async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    })
    if (firstLaunch) {
        console.log('Launch data already loaded');
        return;
    }
    else {
        await populateLaunches();
    }

}

async function findLaunch(filter) {
    return await launches.findOne(filter);
}


async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({ keplerName: launch.target });
    if (!planet) {
        throw new Error('planet was not found');
    }
    const latestFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Zero to Mastery', 'NASA'],
        flightNumber: latestFlightNumber
    })
    await saveLaunch(newLaunch)
}

async function abortLaunchById(launchId) {
    const aborted = await launches.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false
    })

    return aborted.modifiedCount === 1 && aborted.matchedCount === 1
}

module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    loadLaunchesData,
    existsLaunchWithId,
    abortLaunchById
}