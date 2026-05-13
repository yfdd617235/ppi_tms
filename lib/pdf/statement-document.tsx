import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import { PPI_RAZON_SOCIAL, PPI_NIT } from '@/lib/ppi-constants'

const GREEN = '#00261C'
const GREEN_LIGHT = '#edf7f2'
const RED_LIGHT = '#fff5f5'
const BORDER = '#dde0e3'
const TEXT = '#1a1a1a'
const MUTED = '#6b7280'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: TEXT,
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 38,
    height: 38,
    marginRight: 10,
  },
  ppiName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: GREEN,
  },
  ppiNit: {
    fontSize: 8,
    color: MUTED,
    marginTop: 3,
  },
  docTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: GREEN,
    textAlign: 'right',
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: GREEN,
    marginBottom: 12,
  },
  thinDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    marginVertical: 10,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoBlock: {
    flex: 1,
    paddingRight: 8,
  },
  infoLabel: {
    fontSize: 6.5,
    color: MUTED,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
  },
  infoValueSm: {
    fontSize: 8,
    color: TEXT,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  summaryBox: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    marginRight: 6,
  },
  summaryBoxLast: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
  },
  summaryLabel: {
    fontSize: 6.5,
    color: MUTED,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
  },
  summaryGreen: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#15803d',
  },
  summaryRed: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#dc2626',
  },
  sectionTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: MUTED,
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  table: {
    width: '100%',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: GREEN,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  rowIngreso: {
    backgroundColor: GREEN_LIGHT,
  },
  rowEgreso: {
    backgroundColor: RED_LIGHT,
  },
  thText: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
  },
  tdText: { fontSize: 6.5, color: TEXT },
  tdMuted: { fontSize: 6.5, color: MUTED },
  tdGreen: { fontSize: 6.5, color: '#15803d', fontFamily: 'Helvetica-Bold' },
  tdRed: { fontSize: 6.5, color: '#dc2626', fontFamily: 'Helvetica-Bold' },
  tdBold: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: TEXT },
  colFecha: { width: 50 },
  colTipo: { width: 36 },
  colEmpresa: { width: 78 },
  colDesc: { flex: 1 },
  colCuenta: { width: 64 },
  colCargo: { width: 52, textAlign: 'right' },
  colAbono: { width: 52, textAlign: 'right' },
  colCustodia: { width: 44, textAlign: 'right' },
  col4x1000: { width: 42, textAlign: 'right' },
  colSaldo: { width: 56, textAlign: 'right' },
  emptyMsg: {
    padding: 20,
    textAlign: 'center',
    color: MUTED,
    fontSize: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerDisclaimer: {
    fontSize: 6,
    color: MUTED,
    flex: 1,
    marginRight: 20,
  },
  footerPage: {
    fontSize: 7,
    color: MUTED,
  },
})

const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function fmtDate(d: string): string {
  const dt = new Date(d.includes('T') ? d : `${d}T00:00:00Z`)
  return `${String(dt.getUTCDate()).padStart(2, '0')}/${MONTHS[dt.getUTCMonth()]}/${dt.getUTCFullYear()}`
}

function fmtCOP(n: number): string {
  if (n === 0) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n)
}

function trunc(s: string, max: number): string {
  return s.length > max ? s.substring(0, max - 1) + '…' : s
}

export type StatementRow = {
  date: string
  tipo: 'ingreso' | 'egreso'
  empresa: string
  descripcion: string
  cuenta: string
  cargo: number
  abono: number
  tarifa: number
  impuesto: number
  balance: number
}

interface Props {
  logoPng: Buffer | null
  titular: string | null
  titularNit: string | null
  dateFrom: string
  dateTo: string
  rows: StatementRow[]
  showEmpresaCol: boolean
}

export function StatementDocument({ logoPng, titular, titularNit, dateFrom, dateTo, rows, showEmpresaCol }: Props) {
  const totalAbonos = rows.reduce((s, r) => s + r.abono, 0)
  const totalCargos = rows.reduce((s, r) => s + r.cargo, 0)
  const totalCustodia = rows.reduce((s, r) => s + r.tarifa, 0)
  const saldoFinal = rows.length > 0 ? rows[rows.length - 1].balance : 0
  const emitido = fmtDate(new Date().toISOString().split('T')[0])

  return (
    <Document title="Extracto de Cuenta" author={PPI_RAZON_SOCIAL}>
      <Page size="A4" style={styles.page}>

        {/* ── CABECERA ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoPng && (
              <Image src={logoPng} style={styles.logo} />
            )}
            <View>
              <Text style={styles.ppiName}>{PPI_RAZON_SOCIAL}</Text>
              <Text style={styles.ppiNit}>NIT: {PPI_NIT}</Text>
            </View>
          </View>
          <Text style={styles.docTitle}>EXTRACTO DE CUENTA</Text>
        </View>

        <View style={styles.divider} />

        {/* ── INFO TITULAR + PERÍODO ── */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Titular</Text>
            <Text style={styles.infoValue}>
              {titular ?? 'Consolidado — Todas las empresas'}
            </Text>
            {titularNit && (
              <Text style={styles.infoValueSm}>NIT: {titularNit}</Text>
            )}
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Período</Text>
            <Text style={styles.infoValue}>
              {fmtDate(dateFrom)} — {fmtDate(dateTo)}
            </Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Emitido</Text>
            <Text style={styles.infoValueSm}>{emitido}</Text>
          </View>
        </View>

        <View style={styles.thinDivider} />

        {/* ── RESUMEN DEL PERÍODO ── */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total abonos</Text>
            <Text style={styles.summaryGreen}>{fmtCOP(totalAbonos)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total cargos</Text>
            <Text style={styles.summaryRed}>{fmtCOP(totalCargos)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Tarifas custodia</Text>
            <Text style={styles.summaryValue}>{fmtCOP(totalCustodia)}</Text>
          </View>
          <View style={styles.summaryBoxLast}>
            <Text style={styles.summaryLabel}>Saldo neto del período</Text>
            <Text style={saldoFinal >= 0 ? styles.summaryGreen : styles.summaryRed}>
              {fmtCOP(saldoFinal)}
            </Text>
          </View>
        </View>

        {/* ── TABLA DE MOVIMIENTOS ── */}
        <Text style={styles.sectionTitle}>
          Detalle de movimientos ({rows.length} {rows.length === 1 ? 'registro' : 'registros'})
        </Text>

        <View style={styles.table}>
          {/* Encabezado de tabla */}
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.thText, styles.colFecha]}>Fecha</Text>
            <Text style={[styles.thText, styles.colTipo]}>Tipo</Text>
            {showEmpresaCol && <Text style={[styles.thText, styles.colEmpresa]}>Empresa</Text>}
            <Text style={[styles.thText, styles.colDesc]}>Descripción</Text>
            <Text style={[styles.thText, styles.colCuenta]}>Cuenta</Text>
            <Text style={[styles.thText, styles.colCargo]}>Cargo</Text>
            <Text style={[styles.thText, styles.colAbono]}>Abono</Text>
            <Text style={[styles.thText, styles.colCustodia]}>Custodia</Text>
            <Text style={[styles.thText, styles.col4x1000]}>4×1000</Text>
            <Text style={[styles.thText, styles.colSaldo]}>Saldo</Text>
          </View>

          {/* Filas de datos */}
          {rows.map((row, i) => (
            <View
              key={i}
              style={[styles.tableRow, row.tipo === 'ingreso' ? styles.rowIngreso : styles.rowEgreso]}
              wrap={false}
            >
              <Text style={[styles.tdText, styles.colFecha]}>{fmtDate(row.date)}</Text>
              <Text style={[row.tipo === 'ingreso' ? styles.tdGreen : styles.tdRed, styles.colTipo]}>
                {row.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
              </Text>
              {showEmpresaCol && (
                <Text style={[styles.tdText, styles.colEmpresa]}>{trunc(row.empresa, 20)}</Text>
              )}
              <Text style={[styles.tdText, styles.colDesc]}>{trunc(row.descripcion, 40)}</Text>
              <Text style={[styles.tdMuted, styles.colCuenta]}>{trunc(row.cuenta, 16)}</Text>
              <Text style={[row.cargo > 0 ? styles.tdRed : styles.tdMuted, styles.colCargo]}>
                {fmtCOP(row.cargo)}
              </Text>
              <Text style={[row.abono > 0 ? styles.tdGreen : styles.tdMuted, styles.colAbono]}>
                {fmtCOP(row.abono)}
              </Text>
              <Text style={[styles.tdMuted, styles.colCustodia]}>{fmtCOP(row.tarifa)}</Text>
              <Text style={[styles.tdMuted, styles.col4x1000]}>{fmtCOP(row.impuesto)}</Text>
              <Text style={[styles.tdBold, styles.colSaldo]}>{fmtCOP(row.balance)}</Text>
            </View>
          ))}

          {rows.length === 0 && (
            <View style={{ padding: 20 }}>
              <Text style={styles.emptyMsg}>
                No hay movimientos en el período seleccionado.
              </Text>
            </View>
          )}
        </View>

        {/* ── PIE DE PÁGINA ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerDisclaimer}>
            Este documento es un extracto informativo generado automáticamente por el sistema de tesorería de {PPI_RAZON_SOCIAL}.
            No tiene validez como comprobante bancario oficial.
          </Text>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>

      </Page>
    </Document>
  )
}
