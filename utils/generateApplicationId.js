import Application from "../models/application.js";

const generateApplicationId = async () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");

    const lastApp = await Application.findOne({
        applicationId: { $regex: `APP-${year}-${month}` }
    }).sort({ createdAt: -1 });

    let count = 1;

    if (lastApp) {
        count = parseInt(lastApp.applicationId.split("-")[3]) + 1;
    }

    return `APP-${year}-${month}-${String(count).padStart(4, "0")}`;
};

export default generateApplicationId;
