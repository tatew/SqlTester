import mysql from 'mysql2/promise';
import { DB, QUERY_TIMEOUT_MS, HarnessError } from './config.js';

const CONNECTION_CODES = new Set(['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST', 'ENOTFOUND']);

export async function connect() {
  try {
    return await mysql.createConnection({
      ...DB,
      multipleStatements: true,
      rowsAsArray: true, // keeps column order and duplicate column names intact
      dateStrings: true, // DATE/DATETIME come back exactly as MySQL formats them
      supportBigNumbers: true,
      bigNumberStrings: true,
      connectTimeout: 5000,
    });
  } catch (err) {
    if (CONNECTION_CODES.has(err.code)) {
      throw new HarnessError(`Can't reach MySQL at ${DB.host}:${DB.port}. Start it with:  ./sqlt.sh up`);
    }
    throw err;
  }
}

/** Drop + recreate a database and make it the connection's default. */
export async function resetDatabase(conn, name) {
  await conn.query(`DROP DATABASE IF EXISTS \`${name}\``);
  await conn.query(`CREATE DATABASE \`${name}\``);
  await conn.query(`USE \`${name}\``);
}

/** Remove comments so we can tell whether a file contains any actual SQL. */
export function stripComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|\s)(--\s|#)[^\n]*/g, '$1')
    .replace(/(^|\s)--$/gm, '$1');
}

export function isBlank(sql) {
  return stripComments(sql).replace(/;/g, '').trim() === '';
}

/** Run a setup script (schema / data). Errors are tagged with the file they came from. */
export async function execScript(conn, sql, label) {
  if (isBlank(sql)) return;
  try {
    await conn.query(sql);
  } catch (err) {
    throw new HarnessError(`Error in ${label}: ${err.sqlMessage || err.message}`);
  }
}

/**
 * Run a query (possibly several statements) and return the LAST result set
 * that produced rows: { columns: string[], rows: any[][] }.
 */
export async function runQuery(conn, sql) {
  const [results, fields] = await conn.query({ sql, timeout: QUERY_TIMEOUT_MS });

  // Single statement => fields is FieldPacket[]; multiple => fields is (FieldPacket[] | undefined)[].
  const multi = Array.isArray(fields) && fields.length > 0 && (Array.isArray(fields[0]) || fields[0] === undefined);
  const sets = multi
    ? results.map((r, i) => ({ rows: r, fields: fields[i] }))
    : [{ rows: results, fields }];

  const last = sets.filter((s) => Array.isArray(s.fields)).pop();
  if (!last) {
    throw new HarnessError('Your SQL ran, but no statement returned a result set (is there a SELECT?).');
  }
  return { columns: last.fields.map((f) => f.name), rows: last.rows };
}

export function describeSqlError(err) {
  if (err instanceof HarnessError) return err.message;
  if (err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') return `Query timed out after ${QUERY_TIMEOUT_MS} ms.`;
  if (err.sqlMessage) return `MySQL error ${err.code} (${err.errno}): ${err.sqlMessage}`;
  return err.message;
}
