export interface Runnable {
    author: string,
    description: string,
    height: number,
    id: number,
    shortname: string,
    version: string,
    width: number,

    //custom -> maybe removed later
    isRunning?: boolean;
    isPressed?: boolean;
}