import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  alert('配置缺失，请检查 .env 文件')
  throw new Error('配置缺失')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

let currentUser = null
let resumeId = null
let resumeData = {
  avatar: '', name: '', jobTitle: '', phone: '', email: '', address: '',
  birthday: '', workYears: '', education: '', jobIntention: '', summary: '',
  educationList: [], workList: [], projectList: [], awardList: [], skills: []
}

function $(id) { return document.getElementById(id) }

function init() {
  renderApp()
  setupEventListeners()
  checkSession()
}

function renderApp() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Microsoft YaHei', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
      .auth-container { max-width: 400px; margin: 100px auto; background: #fff; border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
      .auth-title { text-align: center; font-size: 24px; color: #2c3e50; margin-bottom: 30px; }
      .auth-tabs { display: flex; margin-bottom: 30px; border-bottom: 2px solid #ecf0f1; }
      .auth-tab { flex: 1; padding: 12px; text-align: center; cursor: pointer; color: #7f8c8d; border-bottom: 3px solid transparent; margin-bottom: -2px; }
      .auth-tab.active { color: #3498db; border-bottom-color: #3498db; }
      .auth-form { display: none; }
      .auth-form.active { display: block; }
      .auth-input { width: 100%; padding: 15px; border: 2px solid #ecf0f1; border-radius: 10px; font-size: 14px; margin-bottom: 15px; }
      .auth-input:focus { outline: none; border-color: #3498db; }
      .auth-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; }
      .auth-btn:hover { opacity: 0.9; }
      .auth-error { color: #e74c3c; margin-top: 15px; text-align: center; }
      .auth-success { color: #27ae60; margin-top: 15px; text-align: center; }
      .hidden { display: none !important; }
      .toolbar { max-width: 900px; margin: 0 auto 20px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
      .toolbar button { padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
      .btn-primary { background: #fff; color: #667eea; }
      .btn-success { background: #27ae60; color: #fff; }
      .btn-danger { background: #e74c3c; color: #fff; }
      .container { max-width: 900px; margin: 0 auto; background: #fff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; }
      .header { background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: #fff; padding: 40px; text-align: center; }
      .avatar { width: 120px; height: 120px; border-radius: 50%; border: 4px solid #fff; background: #ecf0f1; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #bdc3c7; cursor: pointer; }
      .header-input { background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 10px 20px; color: #fff; font-size: 16px; text-align: center; width: 100%; max-width: 400px; margin-bottom: 10px; }
      .header-input::placeholder { color: rgba(255,255,255,0.7); }
      .header-input:focus { outline: none; border-color: #fff; }
      .contact-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
      .contact-input { background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 8px 15px; color: #fff; font-size: 14px; width: 180px; }
      .contact-input::placeholder { color: rgba(255,255,255,0.7); }
      .contact-input:focus { outline: none; border-color: #fff; }
      .content { padding: 30px; }
      .section { margin-bottom: 30px; }
      .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
      .section-title { font-size: 20px; color: #2c3e50; font-weight: bold; padding-bottom: 10px; border-bottom: 3px solid #3498db; }
      .btn-add { padding: 8px 16px; background: #3498db; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
      .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
      .info-item { display: flex; gap: 10px; align-items: center; }
      .info-label { color: #7f8c8d; min-width: 80px; font-size: 14px; }
      .info-input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
      .info-input:focus { outline: none; border-color: #3498db; }
      .textarea-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; line-height: 1.8; resize: vertical; min-height: 100px; }
      .textarea-input:focus { outline: none; border-color: #3498db; }
      .item-card { background: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 15px; position: relative; }
      .item-row { display: flex; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; }
      .item-input { flex: 1; min-width: 150px; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
      .item-input:focus { outline: none; border-color: #3498db; }
      .btn-delete { position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; border: none; background: #e74c3c; color: #fff; border-radius: 50%; cursor: pointer; font-size: 16px; }
      .skills-container { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
      .skill-input { padding: 10px 15px; border: 1px solid #ddd; border-radius: 25px; font-size: 14px; width: 150px; }
      .skill-input:focus { outline: none; border-color: #3498db; }
      .skill-tag { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 8px 15px; border-radius: 25px; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; margin: 5px; }
      .skill-tag button { background: none; border: none; color: #fff; cursor: pointer; font-size: 14px; }
      .user-info { display: flex; align-items: center; gap: 15px; color: #fff; font-size: 14px; }
      .btn-logout { background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 6px; cursor: pointer; }
      .toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #2c3e50; color: #fff; padding: 15px 30px; border-radius: 8px; z-index: 1000; opacity: 0; transition: opacity 0.3s; }
      .toast.show { opacity: 1; }
    </style>
    <div id="authSection" class="auth-container">
      <h2 class="auth-title">简历编辑器</h2>
      <div class="auth-tabs">
        <div class="auth-tab active" id="loginTab">登录</div>
        <div class="auth-tab" id="registerTab">注册</div>
      </div>
      <form id="loginForm" class="auth-form active">
        <input type="email" class="auth-input" id="loginEmail" placeholder="邮箱" required>
        <input type="password" class="auth-input" id="loginPassword" placeholder="密码" required>
        <button type="submit" class="auth-btn">登录</button>
      </form>
      <form id="registerForm" class="auth-form">
        <input type="email" class="auth-input" id="registerEmail" placeholder="邮箱" required>
        <input type="password" class="auth-input" id="registerPassword" placeholder="密码（至少6位）" required minlength="6">
        <button type="submit" class="auth-btn">注册</button>
      </form>
      <div id="authMessage"></div>
    </div>
    <div id="mainSection" class="hidden">
      <div class="toolbar">
        <div class="user-info">
          <span id="userEmail"></span>
          <button class="btn-logout" id="logoutBtn">退出登录</button>
        </div>
      </div>
      <div class="toolbar">
        <button class="btn-primary" id="toggleModeBtn">切换预览/编辑</button>
        <button class="btn-success" id="saveBtn">保存数据</button>
        <button class="btn-danger" id="resetBtn">重置数据</button>
      </div>
      <div class="container">
        <div class="header">
          <div class="avatar" id="avatar"></div>
          <input type="text" class="header-input" id="name" placeholder="请输入姓名">
          <input type="text" class="header-input" id="jobTitle" placeholder="请输入职位">
          <div class="contact-row">
            <input type="text" class="contact-input" id="phone" placeholder="电话">
            <input type="text" class="contact-input" id="email" placeholder="邮箱">
            <input type="text" class="contact-input" id="address" placeholder="地址">
          </div>
        </div>
        <div class="content">
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">基本信息</h2>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">出生年月：</span>
                <input type="text" class="info-input" id="birthday" placeholder="如：1990年5月">
              </div>
              <div class="info-item">
                <span class="info-label">工作年限：</span>
                <input type="text" class="info-input" id="workYears" placeholder="如：5年">
              </div>
              <div class="info-item">
                <span class="info-label">学历：</span>
                <input type="text" class="info-input" id="education" placeholder="如：本科">
              </div>
              <div class="info-item">
                <span class="info-label">求职意向：</span>
                <input type="text" class="info-input" id="jobIntention" placeholder="如：软件工程师">
              </div>
            </div>
          </div>
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">个人简介</h2>
            </div>
            <textarea class="textarea-input" id="summary" rows="4" placeholder="请输入个人简介..."></textarea>
          </div>
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">教育背景</h2>
              <button class="btn-add" id="addEducationBtn">+ 添加</button>
            </div>
            <div id="educationList"></div>
          </div>
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">工作经历</h2>
              <button class="btn-add" id="addWorkBtn">+ 添加</button>
            </div>
            <div id="workList"></div>
          </div>
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">项目经历</h2>
              <button class="btn-add" id="addProjectBtn">+ 添加</button>
            </div>
            <div id="projectList"></div>
          </div>
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">获奖情况</h2>
              <button class="btn-add" id="addAwardBtn">+ 添加</button>
            </div>
            <div id="awardList"></div>
          </div>
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">专业技能</h2>
            </div>
            <input type="text" class="skill-input" id="skillInput" placeholder="输入技能后按回车添加">
            <div class="skills-container" id="skillsList"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="toast" id="toast"></div>
  `
}

function setupEventListeners() {
  $('loginTab').onclick = function() { switchTab('login') }
  $('registerTab').onclick = function() { switchTab('register') }
  $('loginForm').onsubmit = handleLogin
  $('registerForm').onsubmit = handleRegister
  $('logoutBtn').onclick = handleLogout
  $('saveBtn').onclick = saveData
  $('resetBtn').onclick = resetData
  $('toggleModeBtn').onclick = toggleMode
  $('avatar').onclick = changeAvatar
  $('addEducationBtn').onclick = function() { addEducation() }
  $('addWorkBtn').onclick = function() { addWork() }
  $('addProjectBtn').onclick = function() { addProject() }
  $('addAwardBtn').onclick = function() { addAward() }
  $('skillInput').onkeypress = function(e) {
    if (e.key === 'Enter' && this.value.trim()) {
      resumeData.skills.push(this.value.trim())
      this.value = ''
      renderSkills()
    }
  }
}

function checkSession() {
  supabase.auth.getSession().then(function(res) {
    if (res.data && res.data.session) {
      currentUser = res.data.session.user
      showMain()
      loadData()
    }
  })
  
  supabase.auth.onAuthStateChange(function(event, session) {
    if (event === 'SIGNED_IN' && session) {
      currentUser = session.user
      showMain()
      loadData()
    } else if (event === 'SIGNED_OUT') {
      currentUser = null
      resumeId = null
      showAuth()
    }
  })
}

function switchTab(tab) {
  $('loginTab').className = 'auth-tab' + (tab === 'login' ? ' active' : '')
  $('registerTab').className = 'auth-tab' + (tab === 'register' ? ' active' : '')
  $('loginForm').className = 'auth-form' + (tab === 'login' ? ' active' : '')
  $('registerForm').className = 'auth-form' + (tab === 'register' ? ' active' : '')
  $('authMessage').textContent = ''
}

function handleLogin(e) {
  e.preventDefault()
  $('authMessage').className = 'auth-error'
  $('authMessage').textContent = '登录中...'
  
  supabase.auth.signInWithPassword({
    email: $('loginEmail').value,
    password: $('loginPassword').value
  }).then(function(res) {
    if (res.error) {
      $('authMessage').textContent = res.error.message
    } else {
      $('authMessage').textContent = ''
    }
  })
}

function handleRegister(e) {
  e.preventDefault()
  $('authMessage').className = 'auth-error'
  $('authMessage').textContent = '注册中...'
  
  supabase.auth.signUp({
    email: $('registerEmail').value,
    password: $('registerPassword').value
  }).then(function(res) {
    if (res.error) {
      $('authMessage').textContent = res.error.message
    } else {
      $('authMessage').className = 'auth-success'
      $('authMessage').textContent = '注册成功！请查收验证邮件。'
    }
  })
}

function handleLogout() {
  supabase.auth.signOut()
}

function showAuth() {
  $('authSection').className = 'auth-container'
  $('mainSection').className = 'hidden'
}

function showMain() {
  $('authSection').className = 'hidden'
  $('mainSection').className = ''
  $('userEmail').textContent = currentUser ? currentUser.email : ''
}

function loadData() {
  if (!currentUser) return
  supabase.from('resumes').select('*').eq('user_id', currentUser.id).single().then(function(res) {
    if (res.data) {
      resumeId = res.data.id
      resumeData = {
        avatar: res.data.avatar || '',
        name: res.data.name || '',
        jobTitle: res.data.job_title || '',
        phone: res.data.phone || '',
        email: res.data.email || '',
        address: res.data.address || '',
        birthday: res.data.birthday || '',
        workYears: res.data.work_years || '',
        education: res.data.education_level || '',
        jobIntention: res.data.job_intention || '',
        summary: res.data.summary || '',
        educationList: res.data.education_list || [],
        workList: res.data.work_list || [],
        projectList: res.data.project_list || [],
        awardList: res.data.award_list || [],
        skills: res.data.skills || []
      }
    }
    renderAll()
  })
}

function saveData() {
  if (!currentUser) { showToast('请先登录'); return }
  collectData()
  
  var data = {
    user_id: currentUser.id,
    avatar: resumeData.avatar,
    name: resumeData.name,
    job_title: resumeData.jobTitle,
    phone: resumeData.phone,
    email: resumeData.email,
    address: resumeData.address,
    birthday: resumeData.birthday,
    work_years: resumeData.workYears,
    education_level: resumeData.education,
    job_intention: resumeData.jobIntention,
    summary: resumeData.summary,
    education_list: resumeData.educationList,
    work_list: resumeData.workList,
    project_list: resumeData.projectList,
    award_list: resumeData.awardList,
    skills: resumeData.skills
  }

  var promise
  if (resumeId) {
    promise = supabase.from('resumes').update(data).eq('id', resumeId)
  } else {
    promise = supabase.from('resumes').insert(data).select().single()
  }

  promise.then(function(res) {
    if (res.error) {
      showToast('保存失败: ' + res.error.message)
    } else {
      if (res.data) resumeId = res.data.id
      showToast('保存成功')
    }
  })
}

function resetData() {
  if (!confirm('确定重置？')) return
  resumeData = {
    avatar: '', name: '', jobTitle: '', phone: '', email: '', address: '',
    birthday: '', workYears: '', education: '', jobIntention: '', summary: '',
    educationList: [], workList: [], projectList: [], awardList: [], skills: []
  }
  renderAll()
  showToast('已重置')
}

function toggleMode() {
  var inputs = document.querySelectorAll('#mainSection input, #mainSection textarea')
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].readOnly = !inputs[i].readOnly
  }
}

function changeAvatar() {
  var text = prompt('输入头像文字(1-2字)', resumeData.avatar)
  if (text) {
    resumeData.avatar = text.substring(0, 2)
    $('avatar').textContent = resumeData.avatar
  }
}

function collectData() {
  resumeData.avatar = $('avatar').textContent
  resumeData.name = $('name').value
  resumeData.jobTitle = $('jobTitle').value
  resumeData.phone = $('phone').value
  resumeData.email = $('email').value
  resumeData.address = $('address').value
  resumeData.birthday = $('birthday').value
  resumeData.workYears = $('workYears').value
  resumeData.education = $('education').value
  resumeData.jobIntention = $('jobIntention').value
  resumeData.summary = $('summary').value
}

function renderAll() {
  $('avatar').textContent = resumeData.avatar
  $('name').value = resumeData.name
  $('jobTitle').value = resumeData.jobTitle
  $('phone').value = resumeData.phone
  $('email').value = resumeData.email
  $('address').value = resumeData.address
  $('birthday').value = resumeData.birthday
  $('workYears').value = resumeData.workYears
  $('education').value = resumeData.education
  $('jobIntention').value = resumeData.jobIntention
  $('summary').value = resumeData.summary
  renderList('educationList', resumeData.educationList, ['school', 'major', 'degree', 'startTime', 'endTime'])
  renderList('workList', resumeData.workList, ['company', 'position', 'startTime', 'endTime', 'description'])
  renderList('projectList', resumeData.projectList, ['name', 'description'])
  renderList('awardList', resumeData.awardList, ['name', 'org', 'time'])
  renderSkills()
}

function renderList(containerId, list, fields) {
  var html = ''
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    html += '<div class="item-card">'
    html += '<button class="btn-delete" data-idx="' + i + '" data-list="' + containerId + '">×</button>'
    html += '<div class="item-row">'
    for (var j = 0; j < fields.length; j++) {
      var f = fields[j]
      var val = item[f] || ''
      if (f === 'description') {
        html += '<textarea class="textarea-input" data-idx="' + i + '" data-field="' + f + '" data-list="' + containerId + '">' + val + '</textarea>'
      } else {
        html += '<input type="text" class="item-input" value="' + val + '" data-idx="' + i + '" data-field="' + f + '" data-list="' + containerId + '">'
      }
    }
    html += '</div></div>'
  }
  $(containerId).innerHTML = html
  
  var btns = $(containerId).querySelectorAll('.btn-delete')
  for (var k = 0; k < btns.length; k++) {
    btns[k].onclick = function() {
      var idx = parseInt(this.getAttribute('data-idx'))
      var listName = this.getAttribute('data-list')
      if (listName === 'educationList') resumeData.educationList.splice(idx, 1)
      if (listName === 'workList') resumeData.workList.splice(idx, 1)
      if (listName === 'projectList') resumeData.projectList.splice(idx, 1)
      if (listName === 'awardList') resumeData.awardList.splice(idx, 1)
      renderAll()
    }
  }
  
  var inputs = $(containerId).querySelectorAll('input, textarea')
  for (var m = 0; m < inputs.length; m++) {
    inputs[m].onchange = function() {
      var idx = parseInt(this.getAttribute('data-idx'))
      var field = this.getAttribute('data-field')
      var listName = this.getAttribute('data-list')
      var targetList
      if (listName === 'educationList') targetList = resumeData.educationList
      if (listName === 'workList') targetList = resumeData.workList
      if (listName === 'projectList') targetList = resumeData.projectList
      if (listName === 'awardList') targetList = resumeData.awardList
      if (targetList) targetList[idx][field] = this.value
    }
  }
}

function addEducation() {
  resumeData.educationList.push({school:'', major:'', degree:'', startTime:'', endTime:''})
  renderAll()
}

function addWork() {
  resumeData.workList.push({company:'', position:'', startTime:'', endTime:'', description:''})
  renderAll()
}

function addProject() {
  resumeData.projectList.push({name:'', description:''})
  renderAll()
}

function addAward() {
  resumeData.awardList.push({name:'', org:'', time:''})
  renderAll()
}

function renderSkills() {
  var html = ''
  for (var i = 0; i < resumeData.skills.length; i++) {
    html += '<span class="skill-tag">' + resumeData.skills[i]
    html += '<button data-idx="' + i + '">×</button></span>'
  }
  $('skillsList').innerHTML = html
  
  var btns = $('skillsList').querySelectorAll('button')
  for (var j = 0; j < btns.length; j++) {
    btns[j].onclick = function() {
      var idx = parseInt(this.getAttribute('data-idx'))
      resumeData.skills.splice(idx, 1)
      renderSkills()
    }
  }
}

function showToast(msg) {
  var t = $('toast')
  t.textContent = msg
  t.className = 'toast show'
  setTimeout(function() { t.className = 'toast' }, 2000)
}

init()
