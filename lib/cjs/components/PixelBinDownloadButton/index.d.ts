export default function PixelBinDownloadButton({ children, url, urlObj, retryOpts, onDownloadStart, onDownloadFinish, onError, onExhausted, ...restProps }: {
    [x: string]: any;
    children: any;
    url: any;
    urlObj: any;
    retryOpts?: {};
    onDownloadStart?: () => void;
    onDownloadFinish?: () => void;
    onError?: () => void;
    onExhausted?: () => void;
}): JSX.Element;
export function pollTransformedImage(url: any, cancelToken: any, retryOpts: any): any;
