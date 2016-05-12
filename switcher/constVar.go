/**
 * 公共常量和公共函数部分
 */
package switcher

import (
	"database/sql"
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"io/ioutil"
	"os"
	"reflect"
	"time"
)

// 常量部分
const (	
	// 程序端口号
	SERVER_PORT = ":11008"
		
	// 产生随机字符串用的常量
	// 需要产生的字符串类型
	// 纯数字
	KC_RAND_KIND_NUM   = 0
	// 小写字母
	KC_RAND_KIND_LOWER = 1
	// 大写字母
	KC_RAND_KIND_UPPER = 2
	// 数字、大小写字母
	KC_RAND_KIND_ALL   = 3
	
	// sql.null的4中类型
	// sql.NullFloat64
	SQL_NULL_FLOAT64 = "Float64"
	// sql.NullInt64
	SQL_NULL_INT64 = "Int64"
	// sql.NullString
	SQL_NULL_STRING = "String"
	// sql.NullBool
	SQL_NULL_BOOL = "Bool"
)
type Xl map[string]func(*http.Request) (string, interface{})
type UrlParam map[string]string

type RetData struct {
	Success bool        `json:"success"`
	ErrMsg  string      `json:"errMsg"`
	Data    interface{} `json:"data"`
}

// 公共函数部分
// file operate
// 移动/重命名文件
func moveFile(imgRoot, filename, newfilename string) error {
	oldPath := imgRoot + "/" + filename
	newPath := imgRoot + "/" + newfilename
	log.Printf("old: %s|||new:%s", oldPath, newPath)
	return os.Rename(oldPath, newPath)
}

// 获取GET的参数
func GetParameter(r *http.Request, key string) string {
	s := r.URL.Query().Get(key)
//	if s == "" {
//		panic("没有参数" + key)
//	}
	
	return s
}

// 产生随机字符串
func GenerateRandomString(size int, kind int) []byte {
	ikind, kinds, result := kind, [][]int{[]int{10, 48}, []int{26, 97}, []int{26, 65}}, make([]byte, size)
	is_all := kind > 2 || kind < 0
	rand.Seed(time.Now().UnixNano())
	for i :=0; i < size; i++ {
		if is_all { // random ikind
			ikind = rand.Intn(3)
		}
		scope, base := kinds[ikind][0], kinds[ikind][1]
		result[i] = uint8(base+rand.Intn(scope))
	}
	return result
}

// 取得sql.Null系列类型的数据
// data sql.Null系列类型数据
// nulldata  如果data.Valid false的取值
// sql.Null的真实数据的变量名（Float64,Int64,String,Bool）
func getNullData(data interface{}, nulldata interface{}, str string) reflect.Value {
	v := reflect.ValueOf(data)
	if v.FieldByName("Valid").Bool() {
		return v.FieldByName(str)
	} else {
		return reflect.ValueOf(nulldata)
	}
}

// 打印并抛出异常
func perror(e error, errMsg string) {
	if e != nil {
		log.Println(e)
		panic(errMsg)
	}
}

// 打印并抛出异常
func perrorWithRollBack(e error, errMsg string, tx *sql.Tx) {
	if e != nil {
		tx.Rollback()
		log.Println(e)
		panic(errMsg)
	}
}

// 发送http的get请求
// addr发送到的地址 包括http:// + hostname + : + port + / + router
// param发送时需要带的参数
// 返回 请求返回数据中success,errMsg,data3部分中的data部分的json序列化字节数组
func sendHttpGetReq(addr string, param UrlParam) []byte {
	u, err := url.Parse(addr)
	q := u.Query()
	for k, v := range param {
		q.Add(k, v)
	}
	// 额外参数
	q.Add("token", "Jh2044695")
	q.Add("callback", "cb")
	// 参数拼到url中
	u.RawQuery = q.Encode()
	// 发送get请求
	res, err := http.Get(u.String())
	perror(err, "发送请求失败")
	// 读取返回数据
	result, err := ioutil.ReadAll(res.Body)
	defer res.Body.Close()
	perror(err, "发送请求失败")
	// 解析返回数据
	var rtn RetData
	err = json.Unmarshal(result[3:len(result)-1], &rtn)
	perror(err, "发送请求失败")
	// 返回数据显示失败的情况
	if !rtn.Success {
		panic("发送请求失败")
	}
	// 剥离出返回数据中data部分并json序列化成字节数组
	data, err := json.Marshal(rtn.Data)
	perror(err, "发送请求失败")
	return data
}