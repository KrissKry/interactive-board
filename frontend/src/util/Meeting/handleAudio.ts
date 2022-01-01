import { AudioDevice } from '../../interfaces/Meeting/p2p';

export const createAudio = (stream: MediaStream, volume: boolean) : HTMLMediaElement => {
    const newAudioEle = document.createElement('audio');

    newAudioEle.setAttribute('id', stream.id);
    newAudioEle.setAttribute('style', 'display: none;');
    newAudioEle.autoplay = true;
    newAudioEle.controls = false;
    newAudioEle.srcObject = stream;
    // will ye update?
    newAudioEle.volume = volume ? 1 : 0;
    return newAudioEle;
};

export const addAudio = (ele: HTMLMediaElement, parentEleId: string): void => {
    const meetingDiv = document.getElementById(parentEleId);

    if (meetingDiv !== null) meetingDiv.appendChild(ele);
    else throw new TypeError('Parent HTMLElement is null. Cant append');
};

export const removeAudio = (id: string): void => {
    const audioEle = document.getElementById(id);

    if (audioEle !== null) {
        if (audioEle instanceof HTMLMediaElement) {
            document.removeChild(audioEle);
        } else {
            throw new TypeError('Element not of HTMLMedia type');
        }
    } else {
        throw new TypeError('Element is null (not found)');
    }
};

// used custom interface as on some devices InputDeviceInfo is returned instead of MediaDeviceInfo
// (which is undef for some reason)
interface DeviceInfo {
    deviceId: string;

    groupId: string;

    // eslint-disable-next-line no-undef
    kind: MediaDeviceKind;

    label: string;
}

export const getAudioVideoDevicesId = (
    devices: DeviceInfo[],
    // eslint-disable-next-line no-undef
    kind: MediaDeviceKind,
): AudioDevice[] => devices
        .filter((device) => device.kind === kind)
        .map((device) => ({
            deviceId: device.deviceId,
            label: device.label,
        }));

// [...new Set(a)] would be better but
export const getUniqueAudioDevices = (devices: AudioDevice[]): AudioDevice[] => devices.filter((val) => val.deviceId !== 'default' && val.deviceId !== 'communications');
