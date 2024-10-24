import express from "express";

const router = express.Router();
//validations
import { validateLogin } from "../Validations/users/vLogin.js";
import { validateHospitalLogin } from "../Validations/users/vhospitallogin.js";
import { vCreateUser } from "../Validations/vCreateUser.js";

//middleware
import { verifyJwt } from "../jwt/verifyJwt.js";

//mainmethods
import { login } from "../users/Login.js";
import { hospitaladminlogin } from "../users/hospitaladminlogin.js";
import { createUser } from "../users/createUser.js";
import { forgotPassword } from "../users/forgetpassword.js";
import { resetPassword } from "../users/resetPasswordController.js";
import { createListingType } from "../listingTypes/listingType.js";
import { editListingType } from "../listingTypes/editlistingtype.js";
import { deleteListingType } from "../listingTypes/deletelistingtype.js";
import { getAllListingTypes } from "../listingTypes/getalllisttypes.js";

import { createHospital } from "../hospitalTypes/createhospital.js";
import { createPrivateAmbulanceAgent } from "../privateAmbulanceAgent/privateAmbulanceAgent.js";
import { editPrivateAmbulanceAgent } from "../privateAmbulanceAgent/editprivateAmbulanceAgent.js";

import { createFirstAID } from "../firstAIDaddandcreate/createFirst-AID.js";
import { editFirstAID } from "../firstAIDaddandcreate/editfirstaid.js";
import { getAllfirstAID } from "../firstAIDaddandcreate/getAllfirstaid.js";
import { deleteFirstAID } from "../firstAIDaddandcreate/deletefirstaid.js";

import { addFirstAID } from "../firstAIDaddandcreate/addfirstaid.js";
import { getAlladdfirstAID } from "../firstAIDaddandcreate/getAlladdfirstaid.js";
//routes

////add amenities

import { addAmenities } from "../addamenity/addamenities.js";
import { getAllAddAmenities } from "../addamenity/getAllAddAmenities.js";
import { deleteamenities } from "../addamenity/deleteamenities.js";


//add ambulance types

import { addAmbulanceType } from "../addambulancetype/addAmbulanceTypes.js";
import { editAmbulanceType } from "../addambulancetype/editAmbulanceTypes.js";
import { deleteAmbulanceType } from "../addambulancetype/deleteAmbulanceType.js";
import { getAllAmbulanceType } from "../addambulancetype/getAllAmbulanceType.js";

import { createListTypes } from "../alllistingtypesapis/addlistingtypes.js";
import { editListTypes } from "../alllistingtypesapis/editlisttypes.js";
import { deleteListingTypes } from "../alllistingtypesapis/deletelisttypes.js";
import { getAllListsTypes } from "../alllistingtypesapis/getAllListingTypes.js";

import { addbranch } from "../branch/addbranch.js";
import { deletebranch } from "../branch/deletebranch.js";
import { editBranch } from "../branch/editbranch.js";
import { getallbranch } from "../branch/getallbranch.js";

import { addBookingManager } from "../bookingmanager/addbookingmanager.js";
import { editBookingManager } from "../bookingmanager/editbookingmanager.js";
import { deletebookingmanager } from "../bookingmanager/deletebookingmanager.js";
import { getallbookingmanager } from "../bookingmanager/getallbookingmanager.js";

import { createDriver } from "../adddriver/adddriver.js";
import { editdriver } from "../adddriver/editdriver.js";
import { deleteDriver } from "../adddriver/deletedriver.js";
import { getAllDriver } from "../adddriver/getalldriver.js";

import { addprivateambulanceadmin } from "../addprivateambulancedriver/addprivateadmin.js";
import { editprivateambulanceadmin } from "../addprivateambulancedriver/editprivateambulanceadmin.js";
import { deleteAmbulanceprivateadmin } from "../addprivateambulancedriver/deleteprivateambulanceadmin.js";
import { getAllAmbulanceprivateadmin } from "../addprivateambulancedriver/getallprivateambulanceadmin.js";

import { updateCustomerSupport } from "../bookingmanager/editcustomersupport.js";
import { deleteCustomerSupport } from "../bookingmanager/deletecustomersupport.js";
import { getallcustomersupportmanager } from "../bookingmanager/getallcustomersupport.js";

router.post("/login", validateLogin, login);
router.post("/hospitaladminlogin", validateHospitalLogin, hospitaladminlogin);
router.post("/createuser", vCreateUser, createUser);
router.post("/forgetpassword", verifyJwt, forgotPassword);
router.post("/reset-password", verifyJwt, resetPassword);
router.post("/lists", verifyJwt, createListingType);
router.post("/editlisting/:_id", editListingType);
router.post("/deletelisting/:_id", verifyJwt, deleteListingType);


router.post("/createfirstaid", verifyJwt, createFirstAID);
router.post("/editfirstaid/:_id", verifyJwt, editFirstAID);
router.post("/deletefirstaid/:_id", verifyJwt, deleteFirstAID);
router.post("/getallfirstaid", verifyJwt, getAllfirstAID);

router.post("/getalladdfirstaid", verifyJwt, getAlladdfirstAID);
router.post("/addfirstaid", verifyJwt, addFirstAID);
router.post("/editAddFirstAID/:_id", verifyJwt, editAddFirstAID);
router.post("/deleteAddFirstAID/:_id", verifyJwt, deleteAddFirstAID);

router.post("/addamenities", verifyJwt, addAmenities);
router.post("/getalladdamenities", verifyJwt, getAllAddAmenities);
router.post("/editaddamenities/:_id", verifyJwt, editaddamenities);
router.post("/deleteamenities/:_id", verifyJwt, deleteamenities);

router.post("/addambulancetype", verifyJwt, addAmbulanceType);
router.post("/editambulancetype/:_id", verifyJwt, editAmbulanceType);
router.post("/deleteAmbulanceType/:_id", verifyJwt, deleteAmbulanceType);
router.post("/getAllAmbulanceType", verifyJwt, getAllAmbulanceType);

router.post("/createListTypes", verifyJwt, createListTypes);
router.post("/editListTypes/:_id", verifyJwt, editListTypes);
router.post("/deleteListingTypes/:_id", verifyJwt, deleteListingTypes);
router.post("/getAllListsTypes", verifyJwt, getAllListsTypes);

router.post("/addbranch", verifyJwt, addbranch);
router.post("/editbranch/:_id", verifyJwt, editBranch);
router.post("/deletebranch/:_id", verifyJwt, deletebranch);
router.post("/getallbranch", verifyJwt, getallbranch);

router.post("/addbookingmanager", addBookingManager);
router.post("/editbookingmanager/:_id", verifyJwt, editBookingManager);
router.post("/deletebookingmanager/:_id", verifyJwt, deletebookingmanager);
router.post("/getallbookingmanager", getallbookingmanager);

router.post("/adddriver", createDriver);
router.post("/editdriver/:_id", verifyJwt, editdriver);
router.post("/deletedriver/:_id", verifyJwt, deleteDriver);
router.post("/getAlldriver", verifyJwt, getAllDriver);

router.post("/addprivateambulanceadmin", addprivateambulanceadmin);
router.post("/editprivateambulanceadmin/:_id", editprivateambulanceadmin);
router.post("/deleteAmbulanceprivateadmin/:_id", deleteAmbulanceprivateadmin);
router.post("/getAllAmbulanceprivateadmin", getAllAmbulanceprivateadmin);
router.post("/assignBookingManager", assignBookingManager);
router.post("/assigndrivers", assignPrivateAmbulanceToDriver);

export default router;
