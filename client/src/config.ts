export interface GlobalConfig {
    /**
     * The URL of the server.  The frontend will POST there.
     */
    readonly server: string;

    /**
     * The name and URL of the service to display in the dashboard.
     */
    readonly dashboard: {
        readonly name: string;
        readonly url: string;
    };

    /**
     * The display names for the endpoints.
     */
    readonly eventDisplayNames: Record<string, string>;

    /**
     * The baseline success count, as a sum over all endpoints.
     */
    readonly okBase: number;

    /**
     * The baseline error count, as a sum over all endpoints.
     */
    readonly errorBase: number;

    readonly counts: {
        /**
         * (Relative) expected success counts for individual
         * endpoints.
         */
        readonly expectedSuccesses: Record<string, number>;
        /**
         * Expected success count for endpoints that are not
         * mentioned in `expectedSuccesses`.
         */
        readonly defaultExpectedSuccesses: number;
        /**
         * If `expectedSuccesses[endpoint] / thisLoopSuccessCount[endpoint]`
         * falls below this number, that endpoint is considered
         * notable for this loop.  For example, if the expected success
         * count for an endpoint is `10`, and in the current loop it
         * has a count of `20`, then if `notableSuccessThreshold` is
         * `0.6`, it counts as notable because `10/20 < 0.6`.
         */
        readonly notableSuccessThreshold: number;

        /**
         * (Relative) expected error counts for individual
         * endpoints.
         */
        readonly expectedErrors: Record<string, number>;
        /**
         * Expected error count for endpoints that are not
         * mentioned in `expectedSuccesses`.
         */
        readonly defaultExpectedErrors: number;
        /**
         * Threshold for endpoint error notability.  See explanation
         * for `notableSuccessThreshold`.
         */
        readonly notableErrorThreshold: number;
    };

    /**
     * Configurations for modules.
     */
    readonly [name: string]: any;
}

export function getNameForEvent(event: string, config: GlobalConfig): string {
    return config.eventDisplayNames[event] ?? event;
}
