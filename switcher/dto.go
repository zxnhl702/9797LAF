package switcher

import ()

// 文明行为数据s
type goodRecordData struct {
	Cnt int64         `json:"cnt"`     // 总积分
	GR  []goodRecords `json:"records"` // 文明行为记录
}

// 文明行为记录
type goodRecords struct {
	Id    int    `json:"id"`    // 记录编号
	Name  string `json:"name"`  // 记录内容
	Score int64  `json:"score"` // 积分
	Time  string `json:"htime"` // 发生时间
}

// 的士司机信息
type driverInfo struct {
	Id    int    `json:"id"`    // 司机编号
	Name  string `json:"name"`  // 司机姓名
	Phone string `json:"phone"` // 司机电话
	Carno string `json:"carno"` // 车牌号
	Qcno  string `json:"qcno"`  // 从业资格证号码
}
