export const testPostController = (req, res) => {
  const { name } = req.body;
  res.status(200).send(`You name is ${name}`);
};
