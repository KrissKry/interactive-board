export interface PixelChanges {
    color: {
        red: number;
        green: number;
        blue: number;
    },
    points: {
        x: number;
        y: number;
    }[],
}

export interface PixelUpdate {
    point: {
        x: number;
        y: number;
    },
    color: {
        red: number;
        green: number;
        blue: number;
    },
}
