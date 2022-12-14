interface Badge{
    versions: {
        [number: string]: {
            click_action: string;
            click_url: string;
            description: string;
            image_url_1x: string;
            image_url_2x: string;
            image_url_4x: string;
            title: string;
        }
    }
}
interface Badges{
    [name: string]: Badge
}
export default Badges;