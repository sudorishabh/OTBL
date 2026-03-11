"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allActivityOptions = exports.GST_PERCENTAGE = exports.unitOptions = exports.WO_UNITS = exports.WO_ACTIVITIES = exports.processTypeOptions = exports.WO_PROCESS = exports.STATUS = exports.ROLE_HIERARCHY = exports.ROLES = void 0;
exports.ROLES = {
    ADMIN: "admin",
    MANAGER: "manager",
    STAFF: "staff",
    OPERATOR: "operator",
    VIEWER: "viewer",
};
exports.ROLE_HIERARCHY = {
    admin: 5,
    manager: 4,
    staff: 3,
    operator: 2,
    viewer: 1,
};
exports.STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
};
exports.WO_PROCESS = {
    BIOREMEDIATION: "bioremediation",
    RESTORATION: "restoration",
    BIOREMEDIATION_RESTORATION: "bioremediation_restoration",
};
exports.processTypeOptions = [
    { value: exports.WO_PROCESS.BIOREMEDIATION, label: "Bioremediation" },
    { value: exports.WO_PROCESS.RESTORATION, label: "Restoration" },
    {
        value: exports.WO_PROCESS.BIOREMEDIATION_RESTORATION,
        label: "Bioremediation & Restoration (Both)",
    },
];
exports.WO_ACTIVITIES = {
    clean_soil_area: "clean_soil_area",
    LIFTING_OILY_SLUSH_OR_RECOVERY_OF_OIL: "lifting_oily_slush_or_recovery_of_oil",
    EXCAVATION_OIL_CONTAMINATED_SOIL: "excavation_oil_contaminated_soil",
    TRANSPORTATION_CONTAMINATED_SOIL: "transportation_contaminated_soil",
    REFILLING_EXCAVATED_OIL_CONTAMINATED_SOIL_LAND: "refilling_excavated_oil_contaminated_soil_land",
    BIOREMEDIATION_OIL_CONTAMINATED_SOIL: "bioremediation_oil_contaminated_soil",
};
exports.WO_UNITS = {
    M_SQUARE: "m²",
    M_CUBE: "m³",
    MT: "MT",
};
exports.unitOptions = [
    { value: exports.WO_UNITS.M_SQUARE, label: "m² (Square Meter)" },
    { value: exports.WO_UNITS.M_CUBE, label: "m³ (Cubic Meter)" },
    { value: exports.WO_UNITS.MT, label: "MT (Metric Ton)" },
];
exports.GST_PERCENTAGE = 18;
exports.allActivityOptions = [
    {
        value: exports.WO_ACTIVITIES.clean_soil_area,
        label: "Cleaning Up Soil Area",
        isBioremediation: false,
    },
    {
        value: exports.WO_ACTIVITIES.LIFTING_OILY_SLUSH_OR_RECOVERY_OF_OIL,
        label: "Lifting Oily Slush / Recovery of Oil",
        isBioremediation: false,
    },
    {
        value: exports.WO_ACTIVITIES.EXCAVATION_OIL_CONTAMINATED_SOIL,
        label: "Excavation Oil Contaminated Soil",
        isBioremediation: false,
    },
    {
        value: exports.WO_ACTIVITIES.TRANSPORTATION_CONTAMINATED_SOIL,
        label: "Transportation Contaminated Soil",
        isBioremediation: false,
    },
    {
        value: exports.WO_ACTIVITIES.REFILLING_EXCAVATED_OIL_CONTAMINATED_SOIL_LAND,
        label: "Refilling Excavated Oil Contaminated Soil Land",
        isBioremediation: false,
    },
    {
        value: exports.WO_ACTIVITIES.BIOREMEDIATION_OIL_CONTAMINATED_SOIL,
        label: "Bioremediation Oil Contaminated Soil",
        isBioremediation: true,
    },
];
exports.default = {
    ROLES: exports.ROLES,
    STATUS: exports.STATUS,
    ROLE_HIERARCHY: exports.ROLE_HIERARCHY,
    WO_PROCESS: exports.WO_PROCESS,
    WO_ACTIVITIES: exports.WO_ACTIVITIES,
    WO_UNITS: exports.WO_UNITS,
    GST_PERCENTAGE: exports.GST_PERCENTAGE,
    processTypeOptions: exports.processTypeOptions,
    unitOptions: exports.unitOptions,
    allActivityOptions: exports.allActivityOptions,
};
