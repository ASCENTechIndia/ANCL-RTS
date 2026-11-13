const repo = require("./Step0.repo");

async function getNocPurposesService() {
  return await repo.getNocPurposes();
}

async function getVillagesService(ulbId) {
  return await repo.getVillages(ulbId);
}

async function getZonesService(ulbId, serviceId) {
  return await repo.getZones({ ulbId, serviceId });
}

async function getUserMobileService(userId, ulbId) {
  return await repo.getUserMobile({ userId, ulbId });
}

async function getHoardingPlacesService() {
  return await repo.getHoardingPlaces();
}

async function getHoardingTypesService() {
  return await repo.getHoardingTypes();
}

async function getWaterSewerageTypesService() {
  return await repo.getWaterSewerageTypes();
}

async function getPrefilledApplicantService(params) {
  return await repo.getPrefilledApplicant(params);
}

async function searchBirthDetailsService(params) {
  return await repo.searchBirthDetails(params);
}

async function searchDeathDetailsService(params) {
  return await repo.searchDeathDetails(params);
}

async function searchWaterConnectionService(connectionNo, ulbId) {
  return await repo.searchWaterConnection(connectionNo, ulbId);
}

async function submitApplicantInfoService(params) {
  return await repo.insertApplicantInfo(params);
}

async function submitBndApplicantInfoService(params) {
  return await repo.insertBndApplicantInfo(params);
}

async function submitWaterApplicantInfoService(params) {
  return await repo.insertWaterApplicantInfo(params);
}

async function submitImcApplicationService(params) {
  return await repo.insertImcApplication(params);
}

const insertPropertyApplicationDetailsService = async (params) => {
  return await repo.insertPropertyApplicationDetails(params);
};

async function getDocumentsService(params) {
  return await repo.getDocuments(params);
}


module.exports = {
  getNocPurposesService,
  getVillagesService,
  getZonesService,
  getUserMobileService,
  getHoardingPlacesService,
  getHoardingTypesService,
  getWaterSewerageTypesService,
  getPrefilledApplicantService,
  searchBirthDetailsService,
  searchDeathDetailsService,
  searchWaterConnectionService,
  submitApplicantInfoService,
  submitBndApplicantInfoService,
  submitWaterApplicantInfoService,
  submitImcApplicationService,
  insertPropertyApplicationDetailsService,
  getDocumentsService
};