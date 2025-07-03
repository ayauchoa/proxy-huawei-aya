
export default async function handler(req, res) {
  try {
    const loginRes = await fetch("https://la5.fusionsolar.huawei.com/thirdData/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      mode: "cors",
      body: JSON.stringify({
        userName: "SITE_API",
        systemCode: "aya@2024!"
      })
    });

    const token = loginRes.headers.get("xsrf-token");
    const cookies = loginRes.headers.get("set-cookie");
    const body = await loginRes.json();

    if (!token || !cookies) {
      return res.status(401).json({ error: "Token ou cookies não recebidos" });
    }

    if (!body.success) {
      return res.status(401).json({ error: "Falha no login", details: body });
    }

    const stationRes = await fetch("https://la5.fusionsolar.huawei.com/thirdData/getStationRealKpi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "XSRF-TOKEN": token,
        "Cookie": cookies
      },
      body: JSON.stringify({
        stationCodes: [
          "NE=33930879",
          "NE=34859074",
          "NE=34859126",
          "NE=34859026",
          "NE=34917626"
        ]
      })
    });

    const result = await stationRes.json();

    if (!result.success || !result.data) {
      return res.status(500).json({ error: "Falha ao obter dados da API da Huawei", response: result });
    }

    const nomesUsinas = {
      "33930879": "UFV_CON_SP (Conchal)",
      "34859074": "UFV_RIN_SP (Rincão)",
      "34859126": "UFV_ITU_SP (Itu)",
      "34859026": "UFV_PPL_SP (Populina)",
      "34917626": "UFV_GUA_SP (Guarantã)"
    };

    const data = result.data.map(item => {
      const codeClean = item.stationCode.replace("NE=", "");
      const statusCode = item.dataItemMap?.real_health_state;
      return {
        stationCode: item.stationCode,
        nome: nomesUsinas[codeClean] || item.stationCode,
        status: statusCode === 3 ? "Online" : "Offline"
      };
    });

    return res.status(200).json(data);

  } catch (err) {
    console.error("Erro geral:", err);
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
}
