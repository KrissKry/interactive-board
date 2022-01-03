export interface PixelColor {
    red: number;
    green: number;
    blue: number;
}

export interface PixelChanges {
    color: PixelColor,
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
