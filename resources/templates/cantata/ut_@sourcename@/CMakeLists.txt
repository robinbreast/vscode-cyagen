cmake_minimum_required(VERSION 3.20 FATAL_ERROR)

#######################################################################################################
set(LOCAL_SUT_NAME "@sourcename@")
#######################################################################################################

# add stub files
# tst/ut/ut_@sourcename@/stub - @sourcename@ specific stub files which replace common stub (if exists)
add_local_stub(${LOCAL_SUT_NAME})
# TODO: add more stub by using "add_stub_headers" or "add_stub_sources" macro

# turn on to print out header lists
local_print_filelist(false)

# defines a new target for a component
rb_def_target(UNIT_TEST_TARGETS "ut_${LOCAL_SUT_NAME}")

# adds a single unit test
rb_add_unit_test(

    TARGET 
        "ut_${LOCAL_SUT_NAME}"
        
    HEADERS
        ${LOCAL_STUB_HEADERS}

    SOURCES
        ${COMPONENT_PARENT_DIR}/src/${LOCAL_SUT_NAME}.c
        ${LOCAL_STUB_SOURCES}

    UNIT_TEST_HEADERS
        ${CANTATA_INSTALL_PATH}/inc/cantpp.h
    
    UNIT_TEST_SOURCE
        ${COMPONENT_PARENT_DIR}/tst/ut/ut_${LOCAL_SUT_NAME}/ut_${LOCAL_SUT_NAME}.c

#######################################################################################################
    UNIT_TEST_FUNCTIONS
        @fncs@"test_@name@"
        @end-fncs@
#######################################################################################################

#######################################################################################################
# TODO: EDIT: test specification
    UNIT_TEST_SPECIFICATIONS_URL
        @fncs0@"https://rb-alm-08-p.de.bosch.com/qm/web/console/LiDAR_QM/_tBmcjtGOEeqISpkAiDF6Yw#action=com.ibm.rqm.planning.home.actionDispatcher&subAction=viewTestCase&id=@name@"
        @end-fncs0@
#######################################################################################################

    IPG_COP_PATH
        ${CMAKE_CURRENT_LIST_DIR}/ipg.cop
)
