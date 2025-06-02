const { exec } = require('child_process');
const fs = require('fs');
require('process');
const axios = require('axios');
// const schedule = require('node-schedule');
const Diffusion = require('../../Model/Diffusion');
const STATUS_DIFFUSION = require('../Status/diffusion');

module.exports = DiffusionController = {

    // this methode return nothing as response but can be modified to publish event on a broker
    createDiffusion: async function (req, res) {

        // const user_id = req.params.user_id;
        // const projection_id = req.params.projection_id;

        // let isAdmin = false;
        // let projection;
        // verifiy if the user exist an he is an admin
        // await axios.get(`${process.env.GATEWAY}/USER-SERVICE/user?is_admin=${user_id}`).then(res => {
        //     isAdmin = res.data.is_admin;
        // }).catch((error) => console.log(error)
        // );

        if (true) {
            // await axios.get(`${process.env.GATEWAY}/PROJECTION-SERVICE/projection/${projection_id}`).then(res => {
            //     projection = res.data.projection;
            // }).catch((error) => console.log(error)
            // );

            // if the projection exist
            // if (projection == null) {
            //     res.status(404).json({ 'message': `La projection avec id =${projection_id} n'existe pas` });
            // }

            // get projection date to excute this job 10min befor the geven date and hour
            // const projectionDate = new Date(projection.date).toUTCString();
            // const cronJobDate = new Date(new Date(projectionDate).getTime() - 10 * 60 * 1000);

            // cron job
            const streamableVideoURL = DiffusionController.converVideoForStreaming('C:/ffmpeg/1.mp4', '809');
            // const streamableVideoURL = DiffusionController.converVideoForStreaming(projection.film_url, projection_id);

            const diffusion = new Diffusion({
                streamUrl: streamableVideoURL,
                streamableAt: new Date('07/05/2025 01:30:50'),
                // projectionID: projection_id,
            });
            try {
                const newDiffusion = await diffusion.save();
                console.log
                    ({
                        'message': 'salle de diffusion cree',
                        'diffusion': newDiffusion,
                    });
            } catch (error) {

                console.log({
                    'message': error.message,
                })
            }
            // const job = schedule.scheduleJob(cronJobDate, async () => { })
        }

        // none admin
        res.status(403).json({ 'message': `Cette action n'est pas authoriser(Role d'administration requis)` });
    },

    start: function (req, res) {

        const user_id = req.params.userid;
        const diff_id = req.params.diffid;

        return res.json({
            'uid': user_id,
            'did': diff_id,
            'can_procide': true,
        });
    },
    // convert the uploaded video by the project service
    converVideoForStreaming: function (videoUri, event_id) {

        const uploadFolder = 'upload/events/room/' + event_id;

        const lowBitrate = ``;
        const middleBitrate = ``;
        const highBitrate = ``;

        // create event folder
        if (!fs.existsSync(uploadFolder)) {
            fs.mkdirSync(uploadFolder, { recursive: true });
        }

        const ffmpegCommand = `ffmpeg -i ${videoUri} -codec:v h264 -codec:a aac -f hls -hls_time 10 -hls_segment_filename "${uploadFolder}/segment%03d.ts" -start_number 0 ${uploadFolder + '/index.m3u8'}`;

        exec(ffmpegCommand, (error, stdout, stderr) => {
            if (error) {
                console.log('error occured ' + error.message);

            }
            console.log(stdout);
            console.log(stderr);

        });
        return `${process.env.SERVER}/${uploadFolder}/index.m3u8`;
    },
    // add user for an existing event(diffusion)
    addUserToDiffusion: async (req, res) => {

        const user_id = req.params.user_id;
        const projection_id = req.params.projection_id;

        let ticket;

        // verifiy if the user pay ticket
        await axios.get(`${process.env.GATEWAY}/TICKET-SERVICE/ticket/${projection_id}/${user_id}`).then(res => {
            ticket = res.data.ticket;
        }).catch((error) => console.log(error)
        );


        if (ticket != null) {
            let oldDiff = await Diffusion.findOne({ projectionID: projection_id });
            oldDiff.users.push(ticket.user_id);
            oldDiff.save();

            res.status(404).json({
                'message': `L'utilisateur a ete ajouté`,
                'date_diffusion': `${oldDiff.streamableAt}`,
            });
        }

        res.status(404).json({
            'message': 'Cet utlisateur doit souscrire a l\'evenement.'
        });
    },
    // join diffusion
    joinRoom: async (req, res) => {

        // const user_id = req.params.userid;
        const diff_id = req.params.diffid;


        const theRoom = await Diffusion.findOne({
            _id: diff_id,
        });

        if (theRoom == null) {
            res.status(404).json({
                'message': 'Cette diffusion n\'existe pas.'
            });
        }

        // if (theRoom.users.find(user_id) == null) {
        //     res.ok().json({
        //         'message': `Cet utilisateur n'appartient a aucune diffusion avec id${diff_id}`
        //     });
        // }
        // if (theRoom.status != 'LIVE') {
        //     res.status(301).json({
        //         'message': `${STATUS_DIFFUSION.keyoff(theRoom.status)}`,
        //         'status': `${theRoom.status}`,
        //     });
        // }
        const today = new Date(new Date()).getTime();
        const dayToStartEvent = new Date(theRoom.streamableAt).getTime();
        // const dayToStartEvent = new Date(theRoom.streamableAt).getTime();
        const duration = 1413;
        const delay = (today - dayToStartEvent) / 1000;

        const segmentDuration = 10;
        const totalNumberOfSegment = duration / segmentDuration;
        const actualSegmentNumber = Math.floor(delay / segmentDuration);

        // segments
        const segments = []
        for (let i = actualSegmentNumber; i < totalNumberOfSegment; ++i) {
            segments.push(`http://localhost:3001/upload/events/room/809/segment${i}.ts`)
        }

        // #EXTINF:11.166667,
        // segment000.ts
        // #EXTINF:1379.600000,
        // segment001.ts
        // #EXTINF:22.366667,
        // segment002.ts
        // #EXT-X-ENDLIST
        const userStreamData = `#EXTM3U
                                #EXT-X-VERSION:3
                                #EXT-X-TARGETDURATION:${duration}
                                #EXT-X-MEDIA-SEQUENCE:${actualSegmentNumber}
                                ${segments.map(seg =>
            `#EXTINF:${segmentDuration},\n${seg}`
        ).join('\n')}
                                `;

        res.set('Content-Type', 'application/x-mpegURL');
        res.status(301).json({
            'message': `${STATUS_DIFFUSION.LIVE}`,
            'data': `${userStreamData}`,
            'status': `${theRoom.status}`,
        });

    },
}

