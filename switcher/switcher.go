package switcher

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"net/http"
)

func Dispatch(db *sql.DB) Xl {
	return Xl {
		// *************************************
		// select start
		// *************************************
		// 获取文明行为记录
		"getGoodRecordData": func(r *http.Request) (string ,interface{}) {
			// 检索sql
			selectSql1 := "select sum(g.score) from goodRecord g, civilizedTexi c where g.texiId = c.id and c.qcno = ?"
			selectSql2 := "select g.id, g.name, strftime('%Y-%m-%d %H:%M:%S', g.happenedTime), g.score" + 
						" from goodRecord g, civilizedTexi c where g.texiId = c.id and c.qcno = ?" + 
						" order by g.happenedTime desc"
			// 从业资格证号码
			qcno := GetParameter(r, "qcno")
			var gData goodRecordData
			// 总积分
			var cnt sql.NullInt64
			err := db.QueryRow(selectSql1, qcno).Scan(&cnt)
			perror(err, "获取文明行为记录失败")
			gData.Cnt = getNullData(cnt, 0, SQL_NULL_INT64).Int()
			// 文明行为记录
			rows, err := db.Query(selectSql2, qcno)
			defer rows.Close()
			perror(err, "获取文明行为记录失败")
			var gList []goodRecords
			for rows.Next() {
				var g goodRecords
				rows.Scan(&g.Id, &g.Name, &g.Time, &g.Score)
				gList = append(gList, g)
			}
			gData.GR = gList
			return "获取文明行为记录成功", gData
		},
		
		// 获取的士司机信息
		"getDriverInfo": func(r *http.Request) (string, interface{}) {
			// 检索sql
			selectSql := "select id, name, phone, carno, qcno from civilizedTexi where qcno = ?"
			// 从业资格证号码
			qcno := GetParameter(r, "qcno")
			var d driverInfo
			err := db.QueryRow(selectSql, qcno).Scan(&d.Id, &d.Name, &d.Phone, &d.Carno, &d.Qcno)
			perror(err, "获取的士司机信息失败")
			return "获取的士司机信息成功", d
		},
		// *************************************
		// select end
		// *************************************
		// *************************************
		// insert start
		// *************************************
		// 失物招领登记
		"newLostAndFound": func(r *http.Request) (string, interface{}) {
			insertSql := "insert into lostandfound (openid, name, sex, phone, losttime, dept, dest, num, lostlocation, description)" + 
						"values (?, ?, ?, ?, datetime(?), ?, ?, ?, ?, ?)"
			// openid
			openid := GetParameter(r, "openid")
			// 姓名
			name := GetParameter(r, "name")
			// 性别
			sex := GetParameter(r, "sex")
			// 电话
			phone := GetParameter(r, "phone")
			// 时间
			losttime := GetParameter(r, "losttime")
			// 上车地点
			dept := GetParameter(r, "dept")
			// 下车地点
			dest := GetParameter(r, "dest")
			// 乘车人数
			num := GetParameter(r, "num")
			// 遗失位置
			location := GetParameter(r, "location")
			// 失物描述
			description := GetParameter(r, "description")
			// 开始事务
			tx, err := db.Begin()
			// 异常情况下回滚
			perrorWithRollBack(err, "失物招领登记失败", tx)
			stmt, err := tx.Prepare(insertSql)
			perrorWithRollBack(err, "失物招领登记失败", tx)
			_, err = stmt.Exec(openid, name, sex, phone, losttime, dept, dest, num, location, description)
			perrorWithRollBack(err, "失物招领登记失败", tx)
			// 提交事务
			tx.Commit()
			return "失物招领登记成功", nil
		},
		
		// 文明的士登记
		"newDriver": func(r *http.Request) (string, interface{}) {
			insertSql := "insert into civilizedTexi (openid, name, sex, phone, qcno, company, carno, remark) values (?, ?, ?, ?, ?, ?, ?, ?)"
			// openid
			openid := GetParameter(r, "openid")
			// 姓名
			name := GetParameter(r, "name")
			// 性别
			sex := GetParameter(r, "sex")
			// 电话
			phone := GetParameter(r, "phone")
			// 从业资格证号码
			qcno := GetParameter(r, "qcno")
			// 所在公司
			company := GetParameter(r, "company")
			// 车牌号
			carno := GetParameter(r, "carno")
			// 备注
			remark := GetParameter(r, "remark")
			// 开始事务
			tx, err := db.Begin()
			// 异常情况下回滚
			perrorWithRollBack(err, "文明的士登记失败", tx)
			stmt, err := tx.Prepare(insertSql)
			perrorWithRollBack(err, "文明的士登记失败", tx)
			_, err = stmt.Exec(openid, name, sex, phone, qcno, company, carno, remark)
			perrorWithRollBack(err, "文明的士登记失败", tx)
			// 提交事务
			tx.Commit()
			return "文明的士登记成功", nil
		},
		// *************************************
		// insert end
		// *************************************
		// *************************************
		// update start
		// *************************************
		// *************************************
		// update end
		// *************************************
		// *************************************
		// delete start
		// *************************************
		// *************************************
		// delete end
		// *************************************
	}
}