export declare const ROLES: {
    readonly ADMIN: "admin";
    readonly MANAGER: "manager";
    readonly STAFF: "staff";
    readonly OPERATOR: "operator";
    readonly VIEWER: "viewer";
};
export type Role = (typeof ROLES)[keyof typeof ROLES];
export declare const ROLE_HIERARCHY: Record<Role, number>;
export declare const STATUS: {
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
};
export declare const WO_PROCESS: {
    readonly BIOREMEDIATION: "bioremediation";
    readonly RESTORATION: "restoration";
    readonly BIOREMEDIATION_RESTORATION: "bioremediation_restoration";
};
export declare const processTypeOptions: ({
    value: "bioremediation";
    label: string;
} | {
    value: "restoration";
    label: string;
} | {
    value: "bioremediation_restoration";
    label: string;
})[];
export declare const WO_ACTIVITIES: {
    readonly clean_soil_area: "clean_soil_area";
    readonly LIFTING_OILY_SLUSH_OR_RECOVERY_OF_OIL: "lifting_oily_slush_or_recovery_of_oil";
    readonly EXCAVATION_OIL_CONTAMINATED_SOIL: "excavation_oil_contaminated_soil";
    readonly TRANSPORTATION_CONTAMINATED_SOIL: "transportation_contaminated_soil";
    readonly REFILLING_EXCAVATED_OIL_CONTAMINATED_SOIL_LAND: "refilling_excavated_oil_contaminated_soil_land";
    readonly BIOREMEDIATION_OIL_CONTAMINATED_SOIL: "bioremediation_oil_contaminated_soil";
};
export declare const WO_UNITS: {
    readonly M_SQUARE: "m²";
    readonly M_CUBE: "m³";
    readonly MT: "MT";
};
export declare const unitOptions: ({
    value: "m²";
    label: string;
} | {
    value: "m³";
    label: string;
} | {
    value: "MT";
    label: string;
})[];
export declare const GST_PERCENTAGE = 18;
export declare const allActivityOptions: ({
    value: "clean_soil_area";
    label: string;
    isBioremediation: boolean;
} | {
    value: "lifting_oily_slush_or_recovery_of_oil";
    label: string;
    isBioremediation: boolean;
} | {
    value: "excavation_oil_contaminated_soil";
    label: string;
    isBioremediation: boolean;
} | {
    value: "transportation_contaminated_soil";
    label: string;
    isBioremediation: boolean;
} | {
    value: "refilling_excavated_oil_contaminated_soil_land";
    label: string;
    isBioremediation: boolean;
} | {
    value: "bioremediation_oil_contaminated_soil";
    label: string;
    isBioremediation: boolean;
})[];
export type Status = (typeof STATUS)[keyof typeof STATUS];
declare const _default: {
    ROLES: {
        readonly ADMIN: "admin";
        readonly MANAGER: "manager";
        readonly STAFF: "staff";
        readonly OPERATOR: "operator";
        readonly VIEWER: "viewer";
    };
    STATUS: {
        readonly ACTIVE: "active";
        readonly INACTIVE: "inactive";
    };
    ROLE_HIERARCHY: Record<Role, number>;
    WO_PROCESS: {
        readonly BIOREMEDIATION: "bioremediation";
        readonly RESTORATION: "restoration";
        readonly BIOREMEDIATION_RESTORATION: "bioremediation_restoration";
    };
    WO_ACTIVITIES: {
        readonly clean_soil_area: "clean_soil_area";
        readonly LIFTING_OILY_SLUSH_OR_RECOVERY_OF_OIL: "lifting_oily_slush_or_recovery_of_oil";
        readonly EXCAVATION_OIL_CONTAMINATED_SOIL: "excavation_oil_contaminated_soil";
        readonly TRANSPORTATION_CONTAMINATED_SOIL: "transportation_contaminated_soil";
        readonly REFILLING_EXCAVATED_OIL_CONTAMINATED_SOIL_LAND: "refilling_excavated_oil_contaminated_soil_land";
        readonly BIOREMEDIATION_OIL_CONTAMINATED_SOIL: "bioremediation_oil_contaminated_soil";
    };
    WO_UNITS: {
        readonly M_SQUARE: "m²";
        readonly M_CUBE: "m³";
        readonly MT: "MT";
    };
    GST_PERCENTAGE: number;
    processTypeOptions: ({
        value: "bioremediation";
        label: string;
    } | {
        value: "restoration";
        label: string;
    } | {
        value: "bioremediation_restoration";
        label: string;
    })[];
    unitOptions: ({
        value: "m²";
        label: string;
    } | {
        value: "m³";
        label: string;
    } | {
        value: "MT";
        label: string;
    })[];
    allActivityOptions: ({
        value: "clean_soil_area";
        label: string;
        isBioremediation: boolean;
    } | {
        value: "lifting_oily_slush_or_recovery_of_oil";
        label: string;
        isBioremediation: boolean;
    } | {
        value: "excavation_oil_contaminated_soil";
        label: string;
        isBioremediation: boolean;
    } | {
        value: "transportation_contaminated_soil";
        label: string;
        isBioremediation: boolean;
    } | {
        value: "refilling_excavated_oil_contaminated_soil_land";
        label: string;
        isBioremediation: boolean;
    } | {
        value: "bioremediation_oil_contaminated_soil";
        label: string;
        isBioremediation: boolean;
    })[];
};
export default _default;
