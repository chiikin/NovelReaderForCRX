const crypto =require("crypto") ;
function decrypt(data, key) {
    if (key == null) {
      key = crypto
        .createHash("sha256")
        .update("zG2nSeEfSHfvTCHy5LCcqtBbQehKNLXn")
        .digest();
    } else {
      key = crypto
        .createHash("sha256")
        .update(key)
        .digest();
    }
    let decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      key,
      new Uint8Array(16)
    );
    decipher.setAutoPadding(false);
    let decrypted = decipher.update(data, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
let data;
  data="jjUGSk4ZaZ+d7XumG0q4SLn0SGKanjCRzSUcpOFtdJ5ilwTau9h7wz0EKcMCBYVHcUEttleXAukWJDJpo0qwgsTaXaijLI03lsAlWGRmEgU=";
  data="IT+LcNazRBcK54/p1lMtc8uXOZycaFScBHBZppgiVI8j1xkcFk9reaubYdT2CXafzwwdYOJC9k7UTnG6rHAWwQKhB3HThDGo5hXda58I3gvLDPp5pOPspURTtzZr29mLfFk08QgbpTk2e1d7nm/sHarAEa0hbly9K8cjyAiY0Jfyc48mWLAOG5v0oNR0rPiExEwpcWfhr5nOpOq6Xqn3Rw=="
//   data="IT+LcNazRBcK54/p1lMtc0ewNTdT1AVsc0v5Lkpy4zr9G0guIVL63KNzu19KeMTOPdqZNVwK6KyA8j5J7QXsNmRCvwPdrfsu9eexpJVt3I9ETZTWC4JhH8wCLuFvZ4uW";

//data=`jjUGSk4ZaZ+d7XumG0q4SLn0SGKanjCRzSUcpOFtdJ5ilwTau9h7wz0EKcMCBYVHcUEttleXAukWJDJpo0qwgsTaXaijLI03lsAlWGRmEgU=`
//data=`IT+LcNazRBcK54/p1lMtc0ewNTdT1AVsc0v5Lkpy4zr9G0guIVL63KNzu19KeMTOPdqZNVwK6KyA8j5J7QXsNmRCvwPdrfsu9eexpJVt3I9ETZTWC4JhH8wCLuFvZ4uW`

//User-Agent: Android  com.kuangxiangciweimao.novel  2.6.019,meizu, 16s, 28, 9

let ret= decrypt(data);
  console.log(ret);