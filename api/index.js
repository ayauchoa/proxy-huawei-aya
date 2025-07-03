export default function handler(req, res) {
  res.status(200).json({
    message: "API Proxy está no ar! Use /api/huawei-status para consultar status das usinas."
  });
}