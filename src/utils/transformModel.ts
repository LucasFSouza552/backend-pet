const defaultTransform = (_: any, ret: any) => {
    if (ret._id) {
        ret.id = ret._id.toString();
        delete ret._id;
    }
    delete ret.__v;
    return ret;
};

export default defaultTransform;