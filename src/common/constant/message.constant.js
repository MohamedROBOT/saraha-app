

const generateMessage = (entity) => {
  return {
    alreadyExist: `${entity} already exists`,
    notFound: `${entity} not found`,
    created: `${entity} created successfully`,
    updated: `${entity} updated successfully`,
    deleted: `${entity} deleted successfully`,
    failToCreate: `failed to create ${entity}`,
    failToUpdate: `failed to update ${entity}`,
    failToDelete: `failed to delete ${entity}`,
    fetched: `${entity} fetched successfully`,
  };
};

export const SYS_MESSAGE = {
  user: generateMessage("user"),
  message: generateMessage("message"),
};