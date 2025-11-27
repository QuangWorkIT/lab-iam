import { useSelector } from 'react-redux';

const privilegesBaseService = {
    mornitoring: {
        desc: "MONITORING_SERVICE",
        privileges: [
            "VIEW_EVENT_LOGS",
            "VIEW_CONFIGURATION",
            "CREATE_CONFIGURATION",
            "MODIFY_CONFIGURATION",
            "DELETE_CONFIGURATION",
        ]
    },
    testOrder: {
        desc: "TEST_ORDER_SERVICE",
        privileges: [
            "CREATE_TEST_ORDER",
            "MODIFY_TEST_ORDER",
            "DELETE_TEST_ORDER",
            "REVIEW_TEST_ORDER",
            "ADD_COMMENT",
            "MODIFY_COMMENT",
            "DELETE_COMMENT",
        ]
    },
    instrument: {
        desc: "INSTRUMENT_SERVICE",
        privileges: [
            "ADD_REAGENTS",
            "MODIFY_REAGENTS",
            "DELETE_REAGENTS",
            "EXECUTE_BLOOD_TESTING"
        ]
    },
    wareHouse: {
        desc: "WAREHOUSE_SERVICE",
        privileges: [
            "ADD_INSTRUMENT",
            "VIEW_INSTRUMENT",
            "ACTIVATE_DEACTIVATE_INSTRUMENT",
        ]
    },
    patient: {
        desc: "PATIENT_SERVICE",
        privileges: ["READ_ONLY"]
    }
}

const useAllowedService = () => {
    const allowedServices = []
    const privileges = useSelector(state => state.user.userInfo?.privileges)

    for(const privilege in privilegesBaseService){
        const servicePrivileges = privilegesBaseService[privilege].privileges
        const hasPrivilege = servicePrivileges.some(sp => privileges.includes(sp))

        if(hasPrivilege) {
            allowedServices.push(privilegesBaseService[privilege].desc)
        }
    }    
    return allowedServices // return an allowed services array
}

export default useAllowedService;