export default PixelBinImage;
declare function PixelBinImage({ url, urlObj, onLoad, onError, onExhausted, retryOpts, LoaderComponent, ...imgProps }: {
    [x: string]: any;
    url: any;
    urlObj: any;
    onLoad?: () => void;
    onError?: () => void;
    onExhausted?: () => void;
    retryOpts?: {};
    LoaderComponent: any;
}): JSX.Element;
