var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import retry from "async-retry";
import PixelBin from "pixelbin-core-ag";
import { PDKIllegalArgumentError } from "../../errors/PixelBinErrors.js";
const DEFAULT_RETRY_OPTS = {
    retries: 3,
    backOffFactor: 2,
    interval: 500,
};
function fetchImageWithRetry(url, cancelToken, retryOpts) {
    return retry((bail) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield axios.get(url, {
                withCredentials: false,
                responseType: "blob",
                cancelToken: cancelToken,
                validateStatus(status) {
                    return status === 200;
                },
            });
            return response;
        }
        catch (err) {
            // This will trigger a retry
            if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) === 202) {
                return Promise.reject(err);
            }
            // This would exit without any retries
            bail(err);
        }
    }), {
        retries: retryOpts.retries,
        factor: retryOpts.backOffFactor,
        minTimeout: retryOpts.interval,
    });
}
const PixelBinImage = (_a) => {
    var { url, urlObj, onLoad = () => { }, onError = () => { }, onExhausted = () => { }, retryOpts = {}, LoaderComponent } = _a, imgProps = __rest(_a, ["url", "urlObj", "onLoad", "onError", "onExhausted", "retryOpts", "LoaderComponent"]);
    const imgRef = useRef();
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState();
    useEffect(() => {
        // Neither `url` nor `urlObj` was provided
        if (!(url || urlObj))
            return onError(new PDKIllegalArgumentError("Please provide either `url` or `urlObj` prop"));
        try {
            url = urlObj ? PixelBin.utils.objToUrl(urlObj) : url;
        }
        catch (err) {
            return onError(err);
        }
        /**
         * If the component is unmounted before API call finishes, we use CancelToken to cancel the API call.
         * If in case the component unmounts just after the call is finished but any state updates haven't been made,
         * we use `unmounted` to prevent any state updates.
         */
        let unmounted = false;
        let source = axios.CancelToken.source();
        setIsLoading(true);
        setIsSuccess(false);
        /**
         * If image was fetched successfully, set it as the src.
         * If an error occurs & its status is 202, means we ran out of retries.
         * Any other error is a genuine error and needs to be propagated to the caller.
         * Note: `setIsSuccess` is called before updating the src,
         * because img tag needs to be rendered for its ref to be accessed.
         */
        fetchImageWithRetry(url, source.token, Object.assign(Object.assign({}, DEFAULT_RETRY_OPTS), retryOpts))
            .then((result) => {
            if (unmounted)
                return;
            setIsSuccess(true);
            imgRef.current.src = URL.createObjectURL(result.data);
        })
            .catch((err) => {
            var _a;
            if (unmounted)
                return;
            if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) !== 202) {
                return onError(err);
            }
            onExhausted(err);
        })
            .finally(() => setIsLoading(false));
        return () => {
            unmounted = true;
            source.cancel("Cancelling in cleanup");
            // When component is unmounted remove blob from memory
            if (imgRef.current)
                URL.revokeObjectURL(imgRef.current.src);
        };
    }, [url, urlObj]);
    if (isLoading && LoaderComponent) {
        return <LoaderComponent />;
    }
    else if (isSuccess) {
        return (<img 
        // For SSR
        src={typeof window === "undefined" ? url : ""} data-testid="pixelbin-image" ref={imgRef} onLoad={onLoad} onError={onError} {...imgProps}/>);
    }
    else {
        /**
         * If there were any errors in fetching the image, or the retries exhausted
         */
        return <img data-testid="pixelbin-empty-image" {...imgProps}/>;
    }
};
export default PixelBinImage;
//# sourceMappingURL=index.js.map