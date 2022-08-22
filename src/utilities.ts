const getTimeString = (time: number) => {
    const hours = Math.floor(time / 60 / 60);
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time);
    return `${hours}:${`${(minutes - hours * 60)}`.padStart(2, "0")}:${`${(seconds - minutes * 60)}`.padStart(2, "0")}`;
};

export {
    getTimeString
};