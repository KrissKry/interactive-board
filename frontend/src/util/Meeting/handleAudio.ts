export const createAudio = (stream: MediaStream) : HTMLMediaElement => {
    const newAudioEle = document.createElement('audio');

    newAudioEle.setAttribute('id', stream.id);
    newAudioEle.setAttribute('style', 'display: none;');
    newAudioEle.autoplay = true;
    newAudioEle.controls = false;
    newAudioEle.srcObject = stream;
    // will ye update?
    newAudioEle.volume = 1;
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
