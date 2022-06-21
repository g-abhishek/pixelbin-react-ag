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
import React, { useEffect, useState } from "react";
import axios from "axios";
import retry from "async-retry";
import PixelBin from "pixelbin-core-ag";
import { PDKIllegalArgumentError } from "../../errors/PixelBinErrors.js";
const DEFAULT_RETRY_OPTS = {
    retries: 3,
    backOffFactor: 2,
    interval: 500,
};
export const pollTransformedImage = (url, cancelToken, retryOpts) => {
    return retry((bail) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield axios.head(url, {
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
                return Promise.reject(err.response);
            }
            // Any other errors won't be retried
            bail(err);
        }
    }), {
        retries: retryOpts.retries,
        factor: retryOpts.backOffFactor,
        minTimeout: retryOpts.interval
    });
};
export default function PixelBinDownloadButton(_a) {
    var { children, url, urlObj, retryOpts = {}, onDownloadStart = () => { }, onDownloadFinish = () => { }, onError = () => { }, onExhausted = () => { } } = _a, restProps = __rest(_a, ["children", "url", "urlObj", "retryOpts", "onDownloadStart", "onDownloadFinish", "onError", "onExhausted"]);
    const [isUnmounted, setIsUnmounted] = useState(false);
    useEffect(() => {
        return () => setIsUnmounted(true);
    }, []);
    const downloadImage = (e) => {
        e.stopPropagation();
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
        let source = axios.CancelToken.source();
        setIsUnmounted(false);
        onDownloadStart();
        pollTransformedImage(`${url}?download=true`, source.token, Object.assign(Object.assign({}, DEFAULT_RETRY_OPTS), retryOpts))
            .then(() => {
            if (isUnmounted)
                return;
            onDownloadFinish();
            const link = document.createElement("a");
            link.href = `${url}?download=true`;
            link.download = "pixelbin-transformed";
            link.click();
        })
            .catch((err) => {
            var _a;
            if (isUnmounted)
                return;
            console.log(err);
            if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) !== 202) {
                return onError(err);
            }
            onExhausted(err);
        });
    };
    return (<button data-testid="pixelbin-download-button" {...restProps} onClick={downloadImage}>
            {children}
        </button>);
}
//# sourceMappingURL=index.js.map