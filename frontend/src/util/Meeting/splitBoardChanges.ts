import { PixelChanges } from '../../interfaces/Canvas';

const CHUNK_THRESHOLD = 15000;
const CHUNK_LEN = 750; // around sub 16KB data is sent with 750 pixels
export const splitBoardChanges = (changes: PixelChanges): PixelChanges[] => {
    const len = JSON.stringify(changes).length;
    if (len > CHUNK_THRESHOLD) {
        const chunks: PixelChanges[] = [];
        for (let i = 0; i < changes.points.length; i += CHUNK_LEN) {
            // eslint-disable-next-line max-len
            chunks.push({ color: { ...changes.color }, points: [...changes.points.slice(i, i + CHUNK_LEN)] });
        }

        return chunks;
    }

    return [changes];
};
