package main

import (
	"crypto/md5"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"github.com/codegangsta/negroni"
	"github.com/julienschmidt/httprouter"
	_ "github.com/mattn/go-sqlite3"
	"io"
	"log"
	"net/http"
	"time"
	sw "9797LAF/switcher"
	upload "9797LAF/upload"
)

type Ret struct {
	Success bool        `json:"success"`
	ErrMsg  string      `json:"errMsg"`
	Data    interface{} `json:"data"`
}

func main() {
	rt := httprouter.New()
	rt.GET("/laf", lafHandler)
	rt.POST("/upload", upload.UploadHandler)

	n := negroni.Classic()
	n.UseHandler(rt)
	n.Run(":11009")
}

func GetMd5String(s string) string {
	h := md5.New()
	h.Write([]byte(s))
	return hex.EncodeToString(h.Sum(nil))
}

func GetGuid() string {
	b := make([]byte, 48)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		panic("创建文件名出错")
	}
	return GetMd5String(base64.URLEncoding.EncodeToString(b))
}

func SubString(s string, pos, length int) string {
	runes := []rune(s)
	l := pos + length
	if l > len(runes) {
		l = len(runes)
	}
	return string(runes[pos:l])
}

func lafHandler(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
	module := p.ByName("module")
	log.Println("module: " + module + "| cmd: " + sw.GetParameter(r, "cmd"))

	db := ConnectDB("/home/zhangxiangnan/Goproject/src/9797LAFAdmin/middle.db")

	defer func() {
		db.Close()
		err := recover()
		if err != nil {
			rw.Write(GenJsonpResult(r, &Ret{false, err.(string), nil}))
			log.Println(err)
		}
	}()

	switcher := sw.Dispatch(db)
	var ret []byte
	if Authorize(r) {
		msg, data := switcher[sw.GetParameter(r, "cmd")](r)
		log.Println("rth4")
		ret = GenJsonpResult(r, &Ret{true, msg, data})
	} else {
		panic("Not authorized!")
	}
	rw.Write(ret)
}

func DlmHandler(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
	module := p.ByName("module")
	log.Println("module: " + module + "| cmd: " + sw.GetParameter(r, "cmd"))

	db := ConnectDB("middle.db")

	defer func() {
		db.Close()
		err := recover()
		if err != nil {
			rw.Write(GenJsonpResult(r, &Ret{false, err.(string), nil}))
			log.Println(err)
		}
	}()

	switcher := sw.Dispatch(db)
	var ret []byte
	if Authorize(r) {
		msg, data := switcher[sw.GetParameter(r, "cmd")](r)
		log.Println("rth4")
		ret = GenJsonpResult(r, &Ret{true, msg, data})
	} else {
		panic("Not authorized!")
	}
	rw.Write(ret)
}

func Authorize(r *http.Request) bool {
	token := sw.GetParameter(r, "token")
	// log.Println(token)
	return token == "Jh2044695"
}

func GenJsonpResult(r *http.Request, rt *Ret) []byte {
	bs, err := json.Marshal(rt)
	if err != nil {
		panic(err)
	}
	return []byte(sw.GetParameter(r, "callback") + "(" + string(bs) + ")")
}

func ConnectDB(dbPath string) *sql.DB {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		panic(err)
	}
	return db
}

func LogClient(ip string, hot_id string, db *sql.DB) {
	stmt, err := db.Prepare("insert into clicks(ip, hot_id) values(?,?)")
	if err != nil {
		panic(err)
	}
	stmt.Exec(ip, hot_id)
	defer stmt.Close()
}

func formJson(rt *Ret) []byte {
	bs, err := json.Marshal(rt)
	if err != nil {
		panic(err)
	}
	return []byte(string(bs))
}

// 生成随机码 GUID
func generateGuid() string {
	b := make([]byte, 48)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		panic("获取随机码错误")
	}
	h := md5.New()
	h.Write([]byte(base64.URLEncoding.EncodeToString(b)))
	return hex.EncodeToString(h.Sum(nil)) + time.Now().Format("20060102150405")
}
