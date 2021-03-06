//  引入函数库
let Utils = require("../../utils/util.js");
let page = 1;   // 导航下拉滚动的默认值
let downPage = 1; // 整体数据下拉的默认值
let commonArr = []; // 每次加载的数据

// 数据
let data = {
        commons1: [],    // 加载数据存储省市区,
        commons2: [],    // 加载数据存储业务类型,
        CityData: [],   // 城市的数据
        BusinessData: [],   // 业务类型的数据
        TitleData: ['全国', '业务类型', '排序'],   // 导航
        TitleSort: ['按积分', '按评价', '按价格'],  // 排序
        isShow: false,     // 控制下拉的显示隐藏
        newNav: "0",     // 导航默认的选中状态
        newCity: "0",  // 下拉数据第一级数据
        newArea: "-1",   // 下拉数据第二级数据
        mask: false,   // 排序的弹层
        commonList: [],    // 列表的循环的数据
        Stars: [     // 列表的星星
                "",
                "",
                "",
                "",
                ""
        ],
        city: "",   // 选择区的id
        small: "",   // 选择类型的id
        loading: false,    // 加载中.
        order: "0",   // 排序的id
        Ndata: false,    // 没有数据
        indexData: [   // 底部数据
                {
                        text: "首页",
                        cls: "icon-home",
                        ncls: "",
                        id: "1",
                },
                {
                        text: "咨询",
                        cls: "icon-zixunweixuanzhongzhuangtai",
                        ncls: "",
                        id: "2",
                },
                {
                        text: "找律师",
                        cls: "icon-sourencai-weixuanzhong",
                        ncls: "icon-sourencai-xuanzhong",
                        id: "3",
                },
                {
                        text: "我的",
                        cls: "icon-tag-wode-weixuanzhong",
                        ncls: "",
                        id: "4",
                }
        ],
};
Page({
        data: data,
        onLoad: function (options) {
                this.loadDatas();
        },
        loadDatas(){            // 默认加载本地储存的数据
                const lvsBusiness = wx.getStorageSync("lvsBusiness"); 
                const lvsRegion = wx.getStorageSync("lvsRegion"); 

                if (!lvsBusiness){
                        this.BusinessType();  // 加载业务类型的数据
                      
                }else{
                        this.setData({ commons2: lvsBusiness })
                }
                if (!lvsRegion) {
                        this.Provincial();    // 加载省市区的接口数据
                } else {
                        this.setData({ commons1: lvsRegion })
                }

                this.defaultData();   // 默认加载的数据
        },
        Provincial() {     // 请求省市区接口数据
                let _this = this;
                Utils.requestFn({
                        url: "/index.php/catCity?server=1",
                        success(res) {
                                if (res.data.status) {
                                        Utils.setStorage("lvsRegion", res.data.data);
                                        _this.setData({ commons1: res.data.data })
                                } else {
                                        Utils.showModal("请求数据错误");
                                }
                        }
                })

        },
        BusinessType() {   // 请求业务类型的数据接口
                let _this = this;
                Utils.requestFn({
                        url: "/index.php/faqmorecata?server=1",
                        success(res) {
                                if (res.data.status) {
                                        Utils.setStorage("lvsBusiness", res.data.data);
                                        _this.setData({ commons2: res.data.data })
                                } else {
                                        Utils.showModal("请求数据错误");
                                }
                        }
                })
        },
        conmmonData(data) {    // 公共的处理函数
                let isShow = this.data.isShow;
                let _this = this;
                this.setData({ isShow: !isShow, newCity: data[0].id, mask: false, CityData: data })
                this.defaultFn(0);
                page = 1;
        },
        titleFn(event) {    // 切换导航的事件
                var ID = event.target.id;
                let mask = this.data.mask;

                this.setData({ newNav: ID });
                downPage = 1;   // 每次切换的时候恢复默认
                if (ID == "") return false;

                switch (ID) {
                        case "0":
                                this.conmmonData(this.data.commons1);
                                break;
                        case "1":
                                this.conmmonData(this.data.commons2);
                                break;
                        default: {
                                this.setData({ isShow: false, mask: !mask })
                        }
                }
        },
        CityFn(event) {   // 点击市获取对应的数据

                let _this = this;
                let ID = event.target.id;
                let CityData = this.data.CityData;
                this.setData({ newCity: ID })
                CityData.forEach((item) => {
                        let newID = item.id;
                        if (newID == ID) {
                                _this.setData({ BusinessData: item.small })
                        }
                })
        },
        defaultFn(index) {     // 获取二级数据的默认显示
                let CityData = this.data.CityData;
                this.setData({ BusinessData: CityData[index].small })
        },
        areaFn(event) {   // 点击区的事件处理

                let ID = event.target.id;
                let newNav = this.data.newNav;
                this.setData({ newArea: ID, isShow: false, commonList: [] });

                if (newNav != "1") {
                        this.TransferFn({ city: ID })
                        this.setData({ city: ID, small: "" })
                } else {
                        this.TransferFn({ small: ID })
                        this.setData({ city: "", small: ID })
                };

        },
        MaskTestFn(event) {  // 排序弹层的点击

                let ID = event.target.id;
                let newNav = this.data.newNav;
                let city = this.data.city;
                let small = this.data.small;

                downPage = 1;

                this.setData({ mask: false, order: ID, commonList: [] });
                this.TransferFn({ small: small, city: city, page: downPage, order: ID });

        },
        scroll(event) {
                let data = this.data.commons1;
                let newNav = this.data.newNav;
                let scrollTop = event.detail.scrollTop;
        },
        TransferFn({ order = "", small = "", page = 1, lat = "", lng = "", city = "" } = {}) {
                let _this = this;
                this.setData({ loading: true, Ndata: false })
                Utils.requestFn({ // 请求数据加载页面
                        url: "/index.php/layers?server=1",
                        data: {
                                order: order,
                                small: small,
                                page: page,
                                lat: lat,
                                lng: lng,
                                city: city,
                        },
                        success(res) {
                                _this.setData({ loading: false })

                                if (res.data.status) {
                                        let resData = res.data.data;
                                        let commonList = _this.data.commonList;
                                        if (!!resData.length) {
                                                _this.setData({ commonList: commonList.concat(resData), Ndata: false })
                                        } else {
                                                if (page > 1) {
                                                        Utils.showModal("没有数据了。。");
                                                } else {
                                                        _this.setData({ Ndata: true })
                                                }
                                                return false;
                                        }
                                } else {
                                        Utils.showModal("请求数据错误");
                                }
                        }
                })
        },
        onReachBottom() {    // 上拉加载数据

                let newNav = this.data.newNav;
                let city = this.data.city;
                let small = this.data.small;
                let order = this.data.order;

                downPage++;

                switch (newNav) {
                        case "0":
                                this.TransferFn({ city: city, page: downPage });
                                break;
                        case "1":
                                this.TransferFn({ small: small, page: downPage });
                                break;
                        default: {
                                this.TransferFn({ small: small, city: city, page: downPage, order: order });
                        }
                }
        },
        defaultData() {    // 默认的加载的数据
                this.TransferFn();
        },
        JumpDetails(event) {    // 跳转详情页面

                let details = wx.getStorageSync("login");
                let uid = event.currentTarget.dataset.uid;

                let josn = {
                        attid: uid,
                        uid: details.uid,
                        sdk: details.sdk
                };

                Utils.requestFn({
                        url: "/index.php/layerdetail?server=1",
                        data: josn,
                        success(res) {
                                let rData = res.data;
                                if (rData.status) {

                                        Utils.setStorage("Ldetails", rData.data);
                                        wx.navigateTo({
                                                url: `/pages/LawyerDetails/LawyerDetails?attid=${josn.attid}`
                                        })

                                } else {
                                        Utils.showModal("再刷新一下啦，页面报错啦");
                                }
                        }
                })
        },
        Jump(url) { // 跳转的公共的方法
                wx.redirectTo({
                        url: url
                })
        },
        tabFn(e) {   // 切换链接
                let id = e.currentTarget.id;
                switch (id) {
                        case "1":
                                this.Jump("/pages/home/home");
                                break;
                        case "2":
                                this.Jump("/pages/Consultation/Consultation");
                                break;
                        case "3":
                                this.Jump("/pages/lookLvs/lookLvs");
                                break;
                        case "4":
                                this.MyMessage();
                                break;
                }
        },
        MyMessage() {  // 判断有没有登陆的信息
                let login = wx.getStorageSync('login');
                if (login) {
                        this.Jump("/pages/myList/myList");
                } else {
                        this.Jump("/pages/login/login");
                }
        },
        onShareAppMessage(res) {    // 转发
                return {
                        title: '律师帮帮',
                        path: '/pages/LawyersLibrary/LawyersLibrary'
                }
        },
})