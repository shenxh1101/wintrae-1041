export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/tasks/index',
    'pages/report/index',
    'pages/residents/index',
    'pages/statistics/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#165dff',
    navigationBarTitleText: '网格管理',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f6f7'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/tasks/index',
        text: '任务'
      },
      {
        pagePath: 'pages/report/index',
        text: '上报'
      },
      {
        pagePath: 'pages/residents/index',
        text: '居民'
      },
      {
        pagePath: 'pages/statistics/index',
        text: '统计'
      }
    ]
  }
})
