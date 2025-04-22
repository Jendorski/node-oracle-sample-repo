import oracleDB from "oracledb"
import * as dotenv from "dotenv"

dotenv.config()

const init = async () => {
  let connection

  const USER = process.env.NODE_ORACLEDB_USER
  const PASSWORD = process.env.NODE_ORACLEDB_PASSWORD
  const CONNECTION_STRING = process.env.NODE_ORACLEDB_CONNECTION_STRING
  //   console.log({ USER, PASSWORD, CONNECTION_STRING })

  try {
    connection = await oracleDB.getConnection({
      user: USER,
      password: PASSWORD,
      connectionString: CONNECTION_STRING,
    })
    console.log("Run at: " + new Date())
    console.log(
      "Node.js version: " + process.version + " (" + process.platform,
      process.arch + ")"
    )
    console.log("Node-oracledb version:", oracleDB.versionString)
    console.log(
      "Oracle Client library version:",
      oracleDB.oracleClientVersionString
    )
    console.log("Successfully connected to Oracle Database")

    //Create a table
    await connection.execute(
      `begin execute immediate 'drop table todoitem'; exception when others then if sqlcode <> -942 then raise; end if; end;`
    )
    await connection.execute(
      `create table todoitem (id number generated always as identity, description varchar2(4000), creation_ts timestamp with time zone default current_timestamp, done number(1,0), primary key (id))`
    )

    //Insert some data
    const sql = `insert into todoitem (description, done) values(:1, :2)`
    const rows = [
      ["Task 1", 0],
      ["Task 2", 0],
      ["Task 3", 1],
      ["Task 4", 0],
      ["Task 5", 1],
    ]
    let result = await connection.executeMany(sql, rows)
    // console.log(result.rowsAffected, "Rows Inserted")
    connection.commit()

    //Now query the rows back
    const nResult = await connection.execute(
      `select description, done from todoitem`,
      [],
      { resultSet: true, outFormat: oracleDB.OUT_FORMAT_OBJECT }
    )
    console.log({ result })
    console.log({ nResult: nResult })
  } catch (error: Error | unknown) {
    console.log({ error })
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (error: Error | unknown) {
        console.error({ error })
      }
    }
  }
}

init()
