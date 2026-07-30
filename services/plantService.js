// Compatibility facade: import lama tetap valid selama implementasi
// domain dipisahkan berdasarkan tanggung jawabnya.

//===== (Plant Constants and Helpers) ======
export {
  DEMO_PLANT_NAME,
  PLANT_ACCESS_ROLE_VALUES,
  isDemoPlant,
  isValidPlantAccessRole,
  normalizePlantAccessRole,
} from '@/features/plants/services/plantShared';

//===== (Plant CRUD Service) ======
export {
  createPlant,
  deletePlant,
  fetchPlants,
  updatePlant,
} from '@/features/plants/services/plantCrudService';

//===== (Plant Access Service) ======
export {
  addPlantAccessUser,
  fetchPlantAccess,
  removePlantAccessUser,
  searchPlantAccessUsers,
  updatePlantAccessUser,
} from '@/features/plants/services/plantAccessService';

//===== (Plant Device Service) ======
export {
  fetchPlantDevices,
  linkDeviceToPlant,
  unlinkDeviceFromPlant,
} from '@/features/devices/services/plantDeviceService';
