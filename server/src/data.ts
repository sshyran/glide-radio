interface DataPoint {
    readonly endpoint: string;
    readonly success: boolean;
}

export interface IncomingDataPoint extends DataPoint {
    readonly duration: number;
}

export interface DataReceiver {
    addDataPoint(dp: IncomingDataPoint): void;
}

export interface OutgoingDataPoint extends DataPoint {
    count: number;
}

interface IncomingDataPointWithTimestamp extends IncomingDataPoint {
    readonly timestamp: number;
}

export abstract class Counter implements DataReceiver {
    private readonly _window: IncomingDataPointWithTimestamp[] = [];

    constructor(private readonly _windowMS: number) {}

    private enforceWindow(): void {
        const cutoff = Date.now() - this._windowMS;
        const cutoffIndex = this._window.findIndex(d => d.timestamp >= cutoff);
        if (cutoffIndex >= 0) {
            this._window.splice(0, cutoffIndex);
        } else {
            this._window.length = 0;
        }
    }

    protected abstract transform(dp: IncomingDataPoint): OutgoingDataPoint;
    protected abstract transformCount(count: number): number;

    public addDataPoint(dp: IncomingDataPoint): void {
        this.enforceWindow();
        this._window.push({ ...dp, timestamp: Date.now() });
    }

    public getSummary(): readonly OutgoingDataPoint[] {
        this.enforceWindow();

        const points: OutgoingDataPoint[] = [];
        for (const s of this._window) {
            const wp = this.transform(s);
            const { endpoint, count, success } = wp;
            let found = false;
            for (const p of points) {
                if (p.endpoint === endpoint && p.success === success) {
                    p.count += count;
                    found = true;
                    break;
                }
            }
            if (!found) {
                points.push({ endpoint, success, count });
            }
        }

        return points.map(p => ({ ...p, count: this.transformCount(p.count) }));
    }
}

export class UncensoredCounter extends Counter {
    protected transform(dp: IncomingDataPoint): OutgoingDataPoint {
        return {
            endpoint: dp.endpoint,
            success: dp.success,
            count: 1,
        };
    }

    protected transformCount(count: number): number {
        return count;
    }
}

const allowedEndpoints = new Set([
    "processReload",
    "processJob",
    "driveNotification",
    "play",
    "ensureDataLiveliness",
    "appBeacon",
    "getAppSnapshot",
    "generateAppFromDescription",
    "uploadAppFileV2",
    "app",
    "getOAuth2TokensForGoogleSheets",
    "authenticateIntercom",
    "getAppUserForAuthenticatedUser",
    "reloadPublishedAppDataFromSheet",
    "modifySyntheticColumns",
    "getManifest",
    "getPreviewAsUser",
    "getPasswordForOAuth2Token",
    "sendPinForEmail",
    "registerForPushNotifications",
    "getCustomTokenForApp",
    "reportGeocodesInApp",
    "previewCharges",
    "geocodeAddresses",
    "setOrUpdateUser",
    "getUnsplashImages",
    "signInWith",
    "createAppFromTemplate",
    "triggerZap",
    "getFavicon",
    "generatePublishedAppDataFromSheet",
    "deleteApp",
    "setShortName",
    "testIframeEmbeddable",
    "listStripeSubscriptions",
    "duplicateApp",
    "pingUnsplashDownload",
    "setEmailOwnersColumns",
    "sendShareSMS",
    "addTableToApp",
    "triggerAppWebhookAction",
    "getPasswordForEmailPin",
    "getOrganizationMembers",
    "checkDomainConfigured",
    "renameTable",
    "removeTableFromApp",
    "listTables",
    "getOrganizationBilling",
    "prepareReplaceGoogleSheetInApp",
    "inAppPurchase",
    "setAppPlanUnified",
    "exportAppData",
    "inviteToOrganization",
    "createOrganization",
    "integrateWithStripe",
    "sendAppFeedback",
    "makeSupportCodeForApp",
    "setCustomDomain",
    "getTaxInfo",
    "transferAppToOrganization",
    "acceptOrganizationInvite",
    "setAdditionalBillingInfo",
    "addWebhook",
    "requestDownloadLinkForExport",
    "syncTables",
    "linkTablesToApp",
    "accessSupportCode",
    "acquireStripeSessionForTemplatePurchase",
    "removeFromOrganization",
    "applyPromoCode",
    "submitTemplate",
    "deliverEmailFromAction",
    "setTaxInfo",
    "reportApp",
    "stripeInAppPurchaseConfirmIntent",
    "deleteAppUserForApp",
    "inviteUserToTransferApp",
    "acceptAppInvite",
    "setBoostsForOwner",
    "updateUnifiedPaymentInformation",
    "deleteOrganization",
    "createTemplateFromApp",
    "legacyUpgrade",
]);

export class ProdCounter extends Counter {
    protected transform({ endpoint, duration, success }: IncomingDataPoint): OutgoingDataPoint {
        if (!success) {
            return {
                endpoint: "error",
                count: duration,
                success: false,
            };
        }

        if (!allowedEndpoints.has(endpoint)) {
            endpoint = "stuff";
        }

        return {
            endpoint,
            success: true,
            count: duration,
        };
    }

    protected transformCount(count: number): number {
        return Math.round(Math.sqrt(count));
    }
}

export class Multiplexer implements DataReceiver {
    constructor(private readonly _receivers: readonly DataReceiver[]) {}

    public addDataPoint(dp: IncomingDataPoint): void {
        for (const r of this._receivers) {
            r.addDataPoint(dp);
        }
    }
}
