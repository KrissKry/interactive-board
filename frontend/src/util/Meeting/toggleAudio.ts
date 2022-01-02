import { PeerAudioIdentifier } from '../../interfaces/Meeting/p2p';

export const toggleOutgoingAudio = (microphoneOn: boolean, ownMediaStream?: MediaStream): void => {
    console.log(microphoneOn, ownMediaStream?.getAudioTracks());

    if (typeof ownMediaStream !== 'undefined') {
        // eslint-disable-next-line no-restricted-syntax
        for (const track of ownMediaStream.getAudioTracks()) {
            track.enabled = microphoneOn;
        }
    }
};

export const toggleIncomingAudio = (
    volumeOn: boolean,
    audioIdentificators: PeerAudioIdentifier[],
): void => {
    // Array of streamIds which are used for identification of audio elements
    const ids = audioIdentificators.map((item) => item.streamId);

    // loop through all audio elements, and if their id is a stream, toggle volume
    Array
        .from(document.getElementsByTagName('audio'))
        .forEach((item) => {
            if (ids.includes(item.id)) {
                // eslint-disable-next-line no-param-reassign
                item.volume = Number(volumeOn);
            }
        });
};
