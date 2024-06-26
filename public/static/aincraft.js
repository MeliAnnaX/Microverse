/**
 * Spawn entity at the intersection point on click, given the properties passed.
 *
 * `<a-entity intersection-spawn="mixin: box; material.color: red">` will spawn
 * `<a-entity mixin="box" material="color: red">` at intersection point.
 */
AFRAME.registerComponent('intersection-spawn', {
  schema: {
    default: '',
    parse: AFRAME.utils.styleParser.parse
  },

  init: function () {
    const data = this.data;
    const el = this.el;


    el.addEventListener(data.event, evt => {
      let selectionEle=document.getElementById('assetsLibrary');
      let modelListEle=document.getElementById('modelList');
      if((selectionEle.value!='None')){
        let selectionItem=selectionEle.value;
        const pos = AFRAME.utils.clone(evt.detail.intersection.point)
        data.offset = AFRAME.utils.coordinates.parse(data.offset)
        data.snap = AFRAME.utils.coordinates.parse(data.snap)
        pos.x = Math.floor(pos.x / data.snap.x) * data.snap.x + data.offset.x;
        pos.y = Math.floor(pos.y / data.snap.y) * data.snap.y + data.offset.y;
        pos.z = Math.floor(pos.z / data.snap.z) * data.snap.z + data.offset.z;
        const gltfPath =`/static/a-frame-assets/${selectionItem}/${selectionItem}.gltf`;
        let producePromisesQueue = Promise.resolve();
        loadGltfModel(gltfPath, (gltf) => {
          const rootNodeName=gltf.scene.name;
          gltf.scene.traverse((node) => {
              if (node.isMesh) {        
                  //exportNodeAsGltf(node,(blobUrl,gltfString)=> {
                  exportNodeAsGltf_fineGrained(node,(blobUrl,gltfString,imagesString, otherAttributesString)=> {
                    //let boxColor = getRandomColor();
                    let ver = Date.now();
                    let boxId;                    
                    if(node.name.startsWith("mesh_")){
                      boxId = `${rootNodeName}/${node.parent.name}/${node.material.name}/*/1${nodeID}/${ver}`;
                      console.log(node.material.id);
                    }else {
                      boxId = `${rootNodeName}/${node.name}/${node.material.name}/*/1${nodeID}/${ver}`;
                      console.log(node.material.id);
                    }
                    const objectName=`${rootNodeName}/${node.name}/${node.material.name}/*/1`;
                    addNewEntity_finegrained(blobUrl,pos,objectName,boxId,imagesString,otherAttributesString);
                    // const spawnEl = document.createElement('a-entity');
                    // spawnEl.setAttribute('gltf-model', `url(${blobUrl})`);
                    // spawnEl.setAttribute('position', {x:pos.x,y:pos.y,z:pos.z});
                    // //console.log(`${rootNodeName}/${node.name}/${node.material.name}-${nodeID}-${ver}`);
                    // testAndAddModelToCache(`${rootNodeName}/${node.name}/${node.material.name}/1`,blobUrl);
                    // spawnEl.setAttribute('id', boxId);
                    // el.sceneEl.appendChild(spawnEl);
                    let boxJson = {
                      //'@type': 'a-entity',
                      '@id': boxId,
                      '@version': ver,
                      '@name': `/root/${boxId}`,
                      '@children': {},
                      'position': `${pos.x} ${pos.y} ${pos.z}`,
                     // 'material': `color: ${boxColor}`, 
                      'res': gltfString             
                    }
                    let patchJson = {
                      'op': 'new',
                      'value': boxJson,
                      '@name': `/root/${boxId}`,
                      '@version': ver,
                    }
                    
                    producePromisesQueue = producePromisesQueue.then(() => {
                      return aincraft_ts.produce(JSON.stringify(patchJson));
                    }).then(() => {
                      console.log(`Node ${node.name} processed.`);
                    }).catch((error) => {
                      console.error('An error occurred:', error);
                    });
                  

                  });
      
                }
              });
              producePromisesQueue.then(() => {
                console.log('所有节点已顺序处理完成。');
              });
      });



      }else{
        let button = document.getElementById('toggleBoxButton');
        if(button.style.backgroundColor == 'purple') {
          // Create element.
        const spawnEl = document.createElement('a-box');
        const pos = AFRAME.utils.clone(evt.detail.intersection.point)
        data.offset = AFRAME.utils.coordinates.parse(data.offset)
        data.snap = AFRAME.utils.coordinates.parse(data.snap)
        pos.x = Math.floor(pos.x / data.snap.x) * data.snap.x + data.offset.x;
        pos.y = Math.floor(pos.y / data.snap.y) * data.snap.y + data.offset.y;
        pos.z = Math.floor(pos.z / data.snap.z) * data.snap.z + data.offset.z;
        spawnEl.setAttribute('position', pos);
        spawnEl.setAttribute('geometry','{width:0.5,height:0.5,depth:0.5}');        
        let boxColor = getRandomColor();
        spawnEl.setAttribute('material', 'color', boxColor);
        let ver = Date.now()
        let boxId = `box-${ver}`
        spawnEl.setAttribute('id', boxId);
        // Append to scene.
        el.sceneEl.appendChild(spawnEl);
        // Pass to backend
        let boxJson = {
          '@type': 'a-box',
          '@id': boxId,
          '@version': ver,
          '@name': `/root/${boxId}`,
          '@children': {},
          'position': `${pos.x} ${pos.y} ${pos.z}`,
          'material': `color: ${boxColor}`
        }
        let patchJson = {
          'op': 'new',
          'value': boxJson,
          '@name': `/root/${boxId}`,
          '@version': ver,
        }
        aincraft_ts.produce(JSON.stringify(patchJson)).then(() => {
          let patchJsonAdd = {
            'op': 'add',
            'path': `/@children/${boxId}`,
            'value': -1,
            '@name': `/root`,
            '@version': ver,
          }
          aincraft_ts.produce(JSON.stringify(patchJsonAdd))
        })
      
  
        }else if(button.style.backgroundColor == 'gray'){
          const intersectedEl = evt.detail.intersectedEl;
          if(intersectedEl)
          {
            var geometryAttribute = intersectedEl.getAttribute('geometry');
            var elID=intersectedEl.getAttribute('id');
            if(elID===null){
              return;
            }
  
            if(geometryAttribute && (intersectedEl.getAttribute('geometry').primitive === 'box'|| intersectedEl.getAttribute('geometry').primitive === 'cylinder' || intersectedEl.getAttribute('geometry').primitive === 'sphere')){
              let panel= document.getElementById('panel');
              let panelModel= document.getElementById('panelModel');
               let myInput= document.getElementById('myInput');
               let radio1=document.getElementById('radio1');
               const objScale=intersectedEl.getAttribute('scale');
              const ItemPos = intersectedEl.components['position']['data'];
              panel.setAttribute('position',{x: ItemPos.x+2, y: ItemPos.y + 2, z: ItemPos.z});
              myInput.setAttribute('gui-input','value',`(${objScale.x},${objScale.y},${objScale.z})`);
              myInput2.setAttribute('gui-input','value',`(${ItemPos.x},${ItemPos.y},${ItemPos.z})`);
              let objID= document.getElementById('objID');
              let hexColor =intersectedEl.components['material'].data.color;
              let percent = getPercentageFromColor(hexColor);
              const normalizedPercentage = parseFloat(percent) / 100;
              const colorSlider= document.getElementById("colorSlider");
              colorSlider.setAttribute('percent',normalizedPercentage);
              objID.setAttribute("value","id:"+intersectedEl.getAttribute("id"));
              panelModel.setAttribute('visible', false);
              panel.setAttribute('visible', true);
              if(count=='true'){
                radio1.click();
                radio2.click();
                radio3.click();
                count='false';
              }
    
               if(geometryAttribute.primitive=='box' && radio1.getAttribute("toggle-state")==='false'){
                radio1.click();
               }else if(geometryAttribute.primitive=='cylinder' && radio2.getAttribute("toggle-state")==='false'){
                radio2.click();
               }else if(geometryAttribute.primitive=='sphere' && radio3.getAttribute("toggle-state")==='false'){
                radio3.click();
               }
  
                  
            }else if(intersectedEl.getAttribute('gltf-model')){  
              let panelModel= document.getElementById('panelModel');
              let panel= document.getElementById('panel');
               let myInput= document.getElementById('myInputModel');
               let myInput2= document.getElementById('myInput2Model');
               const objScale=intersectedEl.getAttribute('scale');
              const ItemPos = intersectedEl.components['position']['data'];
              panelModel.setAttribute('position',{x: ItemPos.x+2, y: ItemPos.y + 2, z: ItemPos.z});
              myInput.setAttribute('gui-input','value',`(${objScale.x},${objScale.y},${objScale.z})`);
              myInput2.setAttribute('gui-input','value',`(${ItemPos.x},${ItemPos.y},${ItemPos.z})`);
              let objID= document.getElementById('objIDModel');
              objID.setAttribute("value","id:"+intersectedEl.getAttribute("id"));
              panel.setAttribute('visible', false);
              panelModel.setAttribute('visible', true);
            }
          }
        }

      }

      


      

    }); 
  }
});
let count ="true";
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function applyPatch(patch) {
  let patchData = JSON.parse(patch);
  if(patchData.op == 'resize'){
    let targetId = patchData.value['@old_id'];
    let targetNewID=patchData.value['@id'];
    let newScale = patchData.value['scale'];
    let position = patchData.value['position'];
    let boxColor = patchData.value['color'];
    let shape = patchData.value['geometry'];
    let selectionItem=patchData.value['selectionItem'];
    let gltfString=patchData.value['res'];
    position = position.replace(/[{}]/g, '');
    newScale =newScale.replace(/[{}]/g, '');
// 使用split方法分割字符串
let parts = position.split(',');
let parts2 = newScale.split(',');
// 从分割得到的部分中提取x, y, z的值
let posx = parseFloat(parts[0].split(':')[1].trim());
let posy = parseFloat(parts[1].split(':')[1].trim());
let posz = parseFloat(parts[2].split(':')[1].trim());
let scalex = parseFloat(parts2[0].split(':')[1].trim());
let scaley = parseFloat(parts2[1].split(':')[1].trim());
let scalez = parseFloat(parts2[2].split(':')[1].trim());

    let targetEl = document.getElementById(targetId);
    if (shape!=="null" && targetEl) {
      targetEl.setAttribute('position', {x:posx,y:posy,z:posz});
      targetEl.setAttribute('scale', {x:scalex,y:scaley,z:scalez});
      targetEl.setAttribute('material', 'color', boxColor);
      targetEl.setAttribute('geometry', 'primitive', shape);
      console.log("Finish resize");
    }else if(selectionItem && targetEl){
      if(gltfString!=="undefined" && gltfString!==""){
        removeNewEntity(targetId);
        gltfBlob = new Blob([gltfString]);
        blobUrl = URL.createObjectURL(gltfBlob);
        //targetEl.setAttribute('gltf-model', `url(${blobUrl})`);
        // targetEl = document.createElement('a-entity');
        // targetEl.setAttribute('gltf-model', `url(${blobUrl})`);
        // document.getElementsByTagName('a-scene')[0].appendChild(targetEl);
        objectNameExtraction(targetNewID, 2)
        .then(result => addNewEntity(blobUrl,{x:posx,y:posy,z:posz},result,targetNewID))
       .catch(error => console.error(error));
      }

      targetEl.setAttribute('position', {x:posx,y:posy,z:posz});
      targetEl.setAttribute('scale', {x:scalex,y:scaley,z:scalez});
      let inputElement = document.getElementById("myInputModel");
      let inputElement2 = document.getElementById("myInput2Model");
      inputElement2.setAttribute("gui-input","value",`(${posx},${posy},${posz})`);
      inputElement.setAttribute("gui-input","value",`(${scalex},${scaley},${scalez})`);
      let objID = document.getElementById("objIDModel");
      targetEl.setAttribute("id",targetNewID);
      objID.setAttribute("value","id:"+targetEl.getAttribute("id"));
      

//       if(Texture!=""){
//         var loader=new THREE.TextureLoader();
//         var model = targetEl.getObject3D('mesh');
//         loader.load(Texture, function (texture) {              
//           //var texture = document.getElementById('objTexture').getAttribute('src');         
//             // 遍历模型的每个部分
//             model.traverse(function (node) {
//               console.log(node.name);
//               if (node.isMesh) {
//                 // 更换纹理
//                 node.material.map = texture;
//                 node.material.needsUpdate = true;
//                 // exportNodeAsGltf(node,(blobUrl,gltfString)=> {
//                 // const targetNewID
//                 // testAndAddModelToCache(`${rootNodeName}/${node.name}/${node.material.name}/1`,blobUrl);  
//                 // });
//               }  
//             });
//           },
//           undefined,
//           function ( err ) {
//             console.error( 'An error happened.' );
//           }
//           );

// }
//       }
       //newTextureURL=Texture;
     
              
      


    
    return;
  }
  }
  if(patchData.op == 'remove'){
    let targetId = patchData.value['@id'];
    let targetEl = document.getElementById(targetId);
    targetEl.remove();
    
    return;
  }
  if (patchData.op !== 'new') {
    if (patchData.op === 'add' || patchData.op === 'nop') {
      // This is a quick hack: we have already added the box when receiving the `new` patch
      return
    }
    console.error(`Unsupported patch operation: ${patchData.op}`)
    return
  }
  let newObj = patchData.value
  //addNewEntity(blobUrl,pos,objectName,entityID);
  //const spawnEl = document.createElement('a-entity');
  //spawnEl.setAttribute('id', newObj['@id']);
  // let objID = document.getElementById("objIDModel");
  // objID.setAttribute("value","id:"+spawnEl.getAttribute("id"));
  //spawnEl.setAttribute('position', newObj['position']);
  // let inputElement2 = document.getElementById("myInput2Model");
  // inputElement2.setAttribute("gui-input","value",newObj['position']);
  // let inputElement = document.getElementById("myInputModel");
  // inputElement.setAttribute("gui-input","value",`(1,1,1)`);
  //spawnEl.setAttribute('position', newObj['position']);
  if (newObj['@id'].startsWith("box")) {
    // 如果id以"box"开始的操作
    console.log("The id starts with 'box'.");
    spawnEl.setAttribute('material', newObj['material']);
   // AFRAME.utils.entity.setComponentProperty(spawnEl, 'mixin', newObj['mixin']);
} else {
    // 如果id不是以"box"开始的操作
    console.log("The id does not start with 'box'.");
    const gltfString= newObj['res'];
    const gltfBlob = new Blob([gltfString]); 
    const blobUrl = URL.createObjectURL(gltfBlob);
    objectNameExtraction(newObj['@id'], 2)
    .then(result => addNewEntity(blobUrl,newObj['position'],result,newObj['@id']))
    .catch(error => console.error(error));
    let objID = document.getElementById("objIDModel");
    objID.setAttribute("value","id:"+newObj['@id']);
    let inputElement2 = document.getElementById("myInput2Model");
  inputElement2.setAttribute("gui-input","value",newObj['position']);
  let inputElement = document.getElementById("myInputModel");
  inputElement.setAttribute("gui-input","value",`(1,1,1)`); 

    //testAndAddModelToCache(modelName,gltfBlob);
    
    //spawnEl.setAttribute('gltf-model', `url(${blobUrl})`);
    //document.getElementsByTagName('a-scene')[0].appendChild(spawnEl);     
}
  
  
};




let nodeID;
(async () => {
  await aincraft_ts.selfSignCert();
  aincraft_ts.connect();
  aincraft_ts.setApplyPatch(patch => applyPatch(patch));
  aincraft_ts.createSync();
  nodeID = await aincraft_ts.returnNodeId();
})();



window.addEventListener("DOMContentLoaded", (e) => {
  const qrInput = document.getElementById("qr-input");
  qrInput.addEventListener("change", () => {
    for (const file of qrInput.files) {
      aincraft_ts.scanQrCode(file);
    }
  });
  
  window.addEventListener('paste', e => {
    qrInput.files = e.clipboardData.files;
    for (const file of qrInput.files) {
      aincraft_ts.scanQrCode(file);
    }
  });
});

let isListenerAdded = false;
function testInputAction(){
  let panel = document.getElementById("panel");
  let panelModel= document.getElementById('panelModel');
  let inputElement;
  if(panel.getAttribute('visible')===true){
      inputElement = document.getElementById("myInput");
  }else if(panelModel.getAttribute('visible')===true){
      inputElement = document.getElementById("myInputModel");
  }
  if (isListenerAdded2) {
    document.removeEventListener("keyup", handleKeyup2);
    isListenerAdded2 = false;
}
  if (isListenerAdded) return;
  inputElement.focus();
  //inputElement.components.

document.removeEventListener("keyup", handleKeyup);
document.addEventListener("keyup", handleKeyup);
isListenerAdded = true; // 设置标志为true，表示已添加监听器
}


let isListenerAdded2 = false;
function testInputAction2(){
  let panel = document.getElementById("panel");
  let panelModel= document.getElementById('panelModel');
  let inputElement2;
  if(panel.getAttribute('visible')===true){
      inputElement2 = document.getElementById("myInput2");
  }else if(panelModel.getAttribute('visible')===true){
      inputElement2 = document.getElementById("myInput2Model");
  }
  if(isListenerAdded){
    document.removeEventListener("keyup", handleKeyup);
    isListenerAdded = false;
  }
  if (isListenerAdded2) return;
  inputElement2.focus();
  //inputElement.components.
  
document.removeEventListener("keyup", handleKeyup2);
document.addEventListener("keyup", handleKeyup2);
isListenerAdded2 = true; // 设置标志为true，表示已添加监听器
}

function handleKeyup2(event2){
  let panel = document.getElementById("panel");
  let panelModel= document.getElementById('panelModel');
  let inputElement2;
  if(panel.getAttribute('visible')===true){
      inputElement2 = document.getElementById("myInput2");
  }else if(panelModel.getAttribute('visible')===true){
      inputElement2 = document.getElementById("myInput2Model");
  }
  // 如果按下的是ESC键，停止输入
  if (event2.key === "Escape"||event2.key==="Enter") {
    inputElement2.blur(); // 使输入框失去焦点
    document.removeEventListener("keyup", handleKeyup2);
    isListenerAdded2 = false; // 重置标志
      return;
  }
  var newValue
  if(isFinite(event2.key) || event2.key === ','|| event2.key === '('||event2.key === ')'){
    newValue = inputElement2.getAttribute("gui-input").value + event2.key;

  }else if(event2.key === "Backspace"){
    newValue = inputElement2.getAttribute("gui-input").value.slice(0,-1);
  }
  inputElement2.setAttribute("gui-input","value",newValue);
  event2.preventDefault();

  // 将按键值追加到输入框的当前值中
  //inputElement.setAttribute("gui-input").value += event.key;
  
}

function handleKeyup(event){
  let panel = document.getElementById("panel");
  let panelModel= document.getElementById('panelModel');
  let inputElement;
  if(panel.getAttribute('visible')===true){
      inputElement = document.getElementById("myInput");
  }else if(panelModel.getAttribute('visible')===true){
      inputElement = document.getElementById("myInputModel");
  }
  // 如果按下的是ESC键，停止输入
  if (event.key === "Escape"||event.key==="Enter") {
    inputElement.blur(); // 使输入框失去焦点
    document.removeEventListener("keyup", handleKeyup);
    isListenerAdded = false; // 重置标志
      return;
  }
  var newValue
  if(isFinite(event.key) || event.key === ','|| event.key === '('||event.key === ')'){
    newValue = inputElement.getAttribute("gui-input").value + event.key;

  }else if(event.key === "Backspace"){
    newValue = inputElement.getAttribute("gui-input").value.slice(0,-1);
  }
  inputElement.setAttribute("gui-input","value",newValue);
  event.preventDefault();

  // 将按键值追加到输入框的当前值中
  //inputElement.setAttribute("gui-input").value += event.key;
  
}
let isSliderFocused = false;
let isSliderMove=false;
function testSliderAction()
{
  const colorSlider = document.getElementById("colorSlider");
  colorSlider.focus();
  const percentage=colorSlider.components['gui-slider'].data.percent;
  const color = getColorFromPercentage(percentage);
  //console.log(color);
  const sliderLabel=document.getElementById("sliderLabel");
  //sliderLabel.setAttribute("background-color",color);
  //colorSlider.addEventListener('input', handleSliderChange);
  isSliderFocused = true;
  isSliderMove=true;
  document.addEventListener('mousedown', handleDocumentClick);
}

function getColorFromPercentage(p) {
   // 根据百分比得到整数索引
   let index = Math.floor(p * 16777216);

   // 从索引中提取红、绿、蓝值
   let r = (index & 0xFF0000) >> 16;
   let g = (index & 0x00FF00) >> 8;
   let b = index & 0x0000FF;

   // 转换为HEX格式
   return "#" + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}



function getPercentageFromColor(hex) {
   // 从HEX颜色值中提取红、绿、蓝的十进制值
   let r = parseInt(hex.slice(1, 3), 16);
   let g = parseInt(hex.slice(3, 5), 16);
   let b = parseInt(hex.slice(5, 7), 16);

   // 结合红、绿、蓝值为一个整数索引
   let index = (r << 16) + (g << 8) + b;

   // 计算并返回相应的百分比
   return index / 16777215;
}

function handleDocumentClick(event) {
  const colorSlider = document.getElementById("colorSlider");

  // 检查点击的目标是否是颜色滑块
  if (event.target !== colorSlider && isSliderFocused) {
    // 如果不是，并且滑块处于焦点状态，则删除监听器
    document.removeEventListener('mousedown', handleDocumentClick);
    isSliderFocused = false; // 重置标志
  }
}
let isRadio1Clicked = false;
let isRadio2Clicked = false;
let isRadio3Clicked = false;

function testToggleAction() {
  const radio1 = document.getElementById("radio1");
  const radio2 = document.getElementById("radio2");
  const radio3 = document.getElementById("radio3");
 // 第一次点击时，不改变状态，但标记为已点击
 if (!isRadio1Clicked) {
  isRadio1Clicked = true;
  return;
}
  let currentToggleState = radio1.getAttribute("toggle-state");

  if (currentToggleState === "true") {
      // 如果当前状态为true，那么我们将它设置为false
      radio1.setAttribute("toggle-state", "false");
  } else {
      // 如果当前状态为false或未定义，我们将其设置为true
      radio1.setAttribute("toggle-state", "true");
      // 然后检查其他radios的状态，如果它们是true，就触发click事件
      if (radio2.getAttribute("toggle-state") === "true") {
          radio2.click();
      }
      if (radio3.getAttribute("toggle-state") === "true") {
          radio3.click();
      }
  }
}

function testToggleAction2() {
  const radio1 = document.getElementById("radio1");
  const radio2 = document.getElementById("radio2");
  const radio3 = document.getElementById("radio3");
  if (!isRadio2Clicked) {
    isRadio2Clicked = true;
    return;
  }
  let currentToggleState = radio2.getAttribute("toggle-state");

  if (currentToggleState === "true") {
      // 如果当前状态为true，那么我们将它设置为false
      radio2.setAttribute("toggle-state", "false");
  } else {
      // 如果当前状态为false或未定义，我们将其设置为true
      radio2.setAttribute("toggle-state", "true");
      // 然后检查其他radios的状态，如果它们是true，就触发click事件
      if (radio1.getAttribute("toggle-state") === "true") {
          radio1.click();
      }
      if (radio3.getAttribute("toggle-state") === "true") {
          radio3.click();
      }
  }
}

function testToggleAction3() {
  const radio1 = document.getElementById("radio1");
  const radio2 = document.getElementById("radio2");
  const radio3 = document.getElementById("radio3");
  if (!isRadio3Clicked) {
    isRadio3Clicked = true;
    return;
  }
  let currentToggleState = radio3.getAttribute("toggle-state");

  if (currentToggleState === "true") {
      // 如果当前状态为true，那么我们将它设置为false
      radio3.setAttribute("toggle-state", "false");
  } else {
      // 如果当前状态为false或未定义，我们将其设置为true
      radio3.setAttribute("toggle-state", "true");
      // 然后检查其他radios的状态，如果它们是true，就触发click事件
      if (radio2.getAttribute("toggle-state") === "true") {
          radio2.click();
      }
      if (radio1.getAttribute("toggle-state") === "true") {
          radio1.click();
      }
  }
}

function buttonActionFunction(){
  let panel = document.getElementById("panel");
  let panelModel= document.getElementById('panelModel');
  let inputElement,inputElement2,radio1,radio2,radio3,ToggleState1,ToggleState2,ToggleState3,boxColor,intersectedEl,objID ;
  if(panel.getAttribute('visible')===true){
      objID = document.getElementById("objID");
      const idStr=objID.getAttribute("value").split(":")[1].trim();
      intersectedEl = document.getElementById(idStr);
      inputElement = document.getElementById("myInput");
      inputElement2=document.getElementById("myInput2");
      radio1 = document.getElementById("radio1");
      radio2 = document.getElementById("radio2");
      radio3 = document.getElementById("radio3");
      ToggleState1 = radio1.getAttribute("toggle-state");
      ToggleState2 = radio2.getAttribute("toggle-state");
      ToggleState3 = radio3.getAttribute("toggle-state");
      if(ToggleState1==="true"){
        intersectedEl.setAttribute('geometry', 'primitive', "box");
      }else if(ToggleState2==="true"){
        intersectedEl.setAttribute('geometry', 'primitive', "cylinder");
      }else if(ToggleState3==="true"){
          intersectedEl.setAttribute('geometry', 'primitive', "sphere");}
          const colorSlider= document.getElementById("colorSlider");
          const percentageValue=parseFloat(colorSlider.components['gui-slider'].data.percent);
          const newColor = getColorFromPercentage(percentageValue);
          boxColor= intersectedEl.components.material.attrValue;
          if(isSliderMove===true){
            if(newColor){
              intersectedEl.setAttribute('material', 'color', newColor);
              console.log("The color is"+newColor);
              boxColor=newColor;
              }else console.log("The color is undefied");
              isSliderMove=false;
          }

  }else if(panelModel.getAttribute('visible')===true){
      objID = document.getElementById("objIDModel");
      const idStr=objID.getAttribute("value").split(":")[1].trim();;
      intersectedEl = document.getElementById(idStr);
      inputElement = document.getElementById("myInputModel");
      inputElement2 = document.getElementById("myInput2Model");
  }

      
  
      let scaleStr= inputElement.getAttribute("gui-input").value;
      let parts = scaleStr.replace('(', '').replace(')', '').split(',');
      let scalex = parseFloat(parts[0]);
      scalex= Math.round(scalex * 10000) / 10000;
      let scaley = parseFloat(parts[1]);
      scaley= Math.round(scaley * 10000) / 10000;
      let scalez = parseFloat(parts[2]);
      scalez= Math.round(scalez * 10000) / 10000;
      intersectedEl.setAttribute("scale",{x:scalex,y:scaley,z:scalez});
      inputElement.setAttribute("gui-input","value",`(${scalex},${scaley},${scalez})`);
  let posStr= inputElement2.getAttribute("gui-input").value;
  let parts2 = posStr.replace('(', '').replace(')', '').split(',');
  let posStrx = parseFloat(parts2[0]);
  let posStry = parseFloat(parts2[1]);
  let posStrz = parseFloat(parts2[2]);
  posStrx= Math.round(posStrx * 10000) / 10000;
  posStry= Math.round(posStry * 10000) / 10000;
  posStrz= Math.round(posStrz * 10000) / 10000;
  intersectedEl.setAttribute("position",{x:posStrx,y:posStry,z:posStrz});
  inputElement2.setAttribute("gui-input","value",`(${posStrx},${posStry},${posStrz})`);
  textureButton=document.getElementById('textureButton');
  //syncronization
              let boxId= intersectedEl.id;
              const oldID=boxId;
              const index = boxId.indexOf("/node");
              boxId= boxId.substring(0, index);
              let ver=Date.now();
              if(textureButton.value==="" || textureButton.value===undefined){
                boxId= `${boxId}${nodeID}/${ver}`;
              }else{
                 
                 const lastSlashIndex = boxId.lastIndexOf('/');
                 let number = parseInt(boxId.substring(lastSlashIndex + 1))+1;
                 boxId=`${boxId.substring(0, lastSlashIndex + 1)}${number}${nodeID}/${ver}`;
                 
                // /${number}${nodeID}/${ver}`;
               }



              
              intersectedEl.setAttribute("id",boxId);
              objID.setAttribute("value","id:"+intersectedEl.getAttribute("id"));
              let shape=null;
              let selectionItem=null;
              if(intersectedEl.getAttribute('geometry')){
                shape= intersectedEl.getAttribute('geometry').primitive;
              }else {
                selectionItem=boxId.split("-")[0];
              } 
              let boxJson = {
                '@type': 'a-entity',
                '@id': boxId,
                '@old_id': oldID,
                '@version': ver,
                '@name': `/root/${boxId}`,
                '@children': {},
                'position': `{x:${posStrx},y:${posStry},z:${posStrz}}`,
                'color': `${boxColor}`,
                'geometry': `${shape}`,
                'scale':  `{x:${scalex},y:${scaley},z:${scalez}}`,
                'selectionItem': `${selectionItem}`,
                'res':`${textureButton.value}`,
              }

              
              textureButton.value="";
              let patchJson = {
                'op': 'resize',
                'value': boxJson,
                '@name': `/root/${boxId}`,
                '@version': ver,
              }
              aincraft_ts.produce(JSON.stringify(patchJson)).then(() => {
                console.log("Box size updated successfully.");
              })



  panel.setAttribute('visible', false);
}


function buttonActionFunction2(){
  let panel = document.getElementById("panel");
  let panelModel= document.getElementById('panelModel');
  let objID,radio1,radio2,radio3,inputElement,inputElement2;
  if(panel.getAttribute('visible')===true){
    objID = document.getElementById("objID");
    radio1 = document.getElementById("radio1");
    radio2 = document.getElementById("radio2");
    radio3 = document.getElementById("radio3");
    inputElement=document.getElementById("myInput");
    inputElement2 = document.getElementById("myInput2");
    let hexColor =intersectedEl.components['material'].data.color;
  let percent = getPercentageFromColor(hexColor);
  const colorSlider= document.getElementById("colorSlider");
  colorSlider.setAttribute('percent',percent);
  isSliderMove=false;
  var geometryAttribute = intersectedEl.getAttribute('geometry');
  if(geometryAttribute){
    if(geometryAttribute.primitive=='box'){
      radio1.click();
     }else if(geometryAttribute.primitive=='cylinder'){
      radio2.click();
     }else if(geometryAttribute.primitive=='sphere'){
      radio3.click();
     }

  }

  }else if(panelModel.getAttribute('visible')===true){
    objID = document.getElementById("objIDModel");
    inputElement=document.getElementById("myInputModel");
    inputElement2 = document.getElementById("myInput2Model");
    panel=panelModel;

  }

  const idStr=objID.getAttribute("value").split(":")[1].trim();
  let intersectedEl = document.getElementById(idStr);
  const pos= intersectedEl.getAttribute("position");
  const scale= intersectedEl.getAttribute("scale");
  inputElement.setAttribute("gui-input","value",`(${scale.x},${scale.y},${scale.z})`);
  inputElement2.setAttribute("gui-input","value",`(${pos.x},${pos.y},${pos.z})`);
  panel.setAttribute('visible', false);

}

async function loadGltfModel(url, onLoad) {
  const loader = new THREE.GLTFLoader();
  loader.load(url, (gltf) => {
      onLoad(gltf);
  });
}

function exportNodeAsGltf(node,callback) {
  const exporter = new THREE.GLTFExporter();

  // 创建一个新的场景，将节点添加到场景中
  const scene = new THREE.Scene();
  scene.add(node.clone()); // 克隆节点并添加到场景，以避免改变原始模型
  let gltfBlob,blobUrl;
  // 导出场景
  exporter.parse(scene, (gltf) => {
    const gltfString = JSON.stringify(gltf);
    gltfBlob = new Blob([gltfString]);
    blobUrl = URL.createObjectURL(gltfBlob);
    if (callback) {
     callback(blobUrl,gltfString);
 }
  });
}


function exportNodeAsGltf_fineGrained(node,callback) {
  const exporter = new THREE.GLTFExporter();

  // 创建一个新的场景，将节点添加到场景中
  const scene = new THREE.Scene();
  scene.add(node.clone()); // 克隆节点并添加到场景，以避免改变原始模型
  let gltfBlob,blobUrl;
  // 导出场景
  exporter.parse(scene, (gltf) => {
    const gltfString = JSON.stringify(gltf);
    gltfBlob = new Blob([gltfString]);
    blobUrl = URL.createObjectURL(gltfBlob);
    let images =gltf.images;
    delete gltf.images;
    //let gltfObject = JSON.parse(gltf);
    //console.log(gltfObject);
    //let buffers = gltfObject.buffers; // 提取buffers
    //let images = gltfObject.images; // 提取images
    //console.log(images);
    // 删除原对象中的buffers和images，剩下的是其他属性
    //delete gltfObject.buffers;
    //delete gltfObject.images;

    // 准备JSON字符串用于回调或传输
    //const buffersString = JSON.stringify(buffers);
    const imagesString = JSON.stringify(images);
    const otherAttributesString = JSON.stringify(gltf);
    if (callback) {
      callback(blobUrl,gltfString,imagesString, otherAttributesString);
    }
  }, {binary: false});
}

function getTextureURL(selectedMaterial) {
  switch (selectedMaterial) {
    case 'Dark':
      return './static/textures/Dark.png';
    case 'Abstract':
      return './static/textures/Abstract.png';
    case 'Cyberpunk':
      return './static/textures/Cyberpunk.png';
    default:
      return '';
  }
}

 /*function buttonSelectionModel() {
  const newTextureURL = './static/a-frame-assets/medieval_table_free/textures/EA_PrimitiveTable_baseColor.png';
  const textureButton = document.getElementById('textureButton');

  convertImageToBase64(newTextureURL, function(base64String) {
    textureButton.value = base64String;
    console.log(textureButton.value);
  });

  const objID = document.getElementById("objIDModel");
  const idStr = objID.getAttribute("value").split(":")[1].trim();
  const intersectedEl = document.getElementById(idStr);

  if (!intersectedEl) {
    console.error('Element with given ID not found');
    return;
  }

  const model = intersectedEl.getObject3D('mesh');
  if (!model) {
    console.error('Mesh not found in the given element');
    return;
  }

  let boxId = intersectedEl.id;
  const index = boxId.indexOf("/node");
  boxId = boxId.substring(0, index);

  const loader = new THREE.TextureLoader();

  loader.load(
    newTextureURL,
    function(texture) {
      if (!texture) {
        console.error('Texture loading failed');
        return;
      }

      model.traverse(function(node) {
        if (node.isMesh) {
          node.material.map = texture;
          node.material.needsUpdate = true;

          exportNodeAsGltf_fineGrained(node, (blobUrl, gltfString, imagesString, otherAttributesString) => {
            objectNameExtraction(idStr, 2)
              .then(result => {
                const asteriskIndex = result.lastIndexOf('/*//*');
                const number = parseInt(result.substring(asteriskIndex + 3)) + 1;
                const gltfBlob_images = new Blob([imagesString]);
                const blobUrl_images = URL.createObjectURL(gltfBlob_images);
                testAndAddModelToCache(result.substring(0, asteriskIndex + 3) + number, blobUrl_images);
                textureButton.value = imagesString;
              })
              .catch(error => console.error(error));
          });
        }
      });
    },
    undefined,
    function(err) {
      console.error('An error happened during texture loading.', err);
    }
  );
}*/

let modelCache = {
  'None': ''
}; 

function buttonSelectionModel() {
  const materialSelector = document.getElementById('materialSelector');
  
  // 获取选中模型的 ID 和位置
  const objID = document.getElementById("objIDModel");
  const idStr = objID.getAttribute("value").split(":")[1].trim();
  const intersectedEl = document.getElementById(idStr);

  if (!intersectedEl) {
    console.error('Element with given ID not found');
    return;
  }

  const modelPosition = intersectedEl.getAttribute('position');

  // 设置材质选择框的位置
  materialSelector.setAttribute('position', {
    x: modelPosition.x + 5.3, // 将选择框移动到模型右侧
    y: modelPosition.y + 2,
    z: modelPosition.z
  });

  // 显示材质选择框
  materialSelector.setAttribute('visible', 'true');
}



function applyMaterial(selectedMaterial) {
  if (!selectedMaterial) return;

  const newTextureURL = getTextureURL(selectedMaterial);
  const textureButton = document.getElementById('textureButton');

  convertImageToBase64(newTextureURL, function(base64String) {
    textureButton.value = base64String;
    console.log(textureButton.value);
  });

  const objID = document.getElementById("objIDModel");
  const idStr = objID.getAttribute("value").split(":")[1].trim();
  const intersectedEl = document.getElementById(idStr);

  if (!intersectedEl) {
    console.error('Element with given ID not found');
    return;
  }

  const model = intersectedEl.getObject3D('mesh');
  if (!model) {
    console.error('Mesh not found in the given element');
    return;
  }

  const loader = new THREE.TextureLoader();

  loader.load(
    newTextureURL,
    function(texture) {
      if (!texture) {
        console.error('Texture loading failed');
        return;
      }

      model.traverse(function(node) {
        if (node.isMesh) {
          node.material.map = texture;
          node.material.needsUpdate = true;

          exportNodeAsGltf_fineGrained(node, (blobUrl, gltfString, imagesString, otherAttributesString) => {
            objectNameExtraction(idStr, 2)
              .then(result => {
                const asteriskIndex = result.lastIndexOf('/*/');
                const number = parseInt(result.substring(asteriskIndex + 3)) + 1;
                const gltfBlob_images = new Blob([imagesString]);
                const blobUrl_images = URL.createObjectURL(gltfBlob_images);
                testAndAddModelToCache(result.substring(0, asteriskIndex + 3) + number, blobUrl_images);
                textureButton.value = imagesString;
              })
              .catch(error => console.error(error));
          });
        }
      });

      // 隐藏材质选择框
      const materialSelector = document.getElementById('materialSelector');
      materialSelector.setAttribute('visible', 'false');
    },
    undefined,
    function(err) {
      console.error('An error happened during texture loading.', err);
    }
  );
}


function addModelToCache(modelName, blobUrl) {
  // 创建blob URL并添加到模型缓存中

  modelCache[modelName] = blobUrl;

  // 更新HTML列表
  updateModelList();
}

function updateModelList() {
  const modelListElement = document.getElementById('modelList');
  modelListElement.innerHTML = ''; // 清空当前列表

  Object.entries(modelCache).forEach(([modelName, url]) => {
    const optionItem = document.createElement('option');
    optionItem.textContent = modelName;
    optionItem.title = modelName;
    optionItem.value=url;
    modelListElement.appendChild(optionItem);
  });
}

function convertImageToBase64(url, callback) {
  var img = new Image();
  img.crossOrigin = 'Anonymous'; // 这一行很重要，特别是对于跨域请求的图片
  img.onload = function() {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      canvas.height = this.naturalHeight;
      canvas.width = this.naturalWidth;
      ctx.drawImage(this, 0, 0);
      var dataURL = canvas.toDataURL('image/jpeg');
      callback(dataURL);
  };
  img.src = url;
}

function buttonActionFunction3() {
  let panelModel = document.getElementById('panelModel');
  let objID, boxId;

  if (panelModel.getAttribute('visible') === 'true' || panelModel.getAttribute('visible') === true) {
    objID = document.getElementById("objIDModel");
    boxId = objID.getAttribute("value").split(":")[1].trim();
    let idStr = boxId;

    console.log(`Attempting to remove entity with ID: ${idStr}`);
    removeNewEntity(idStr);

    panelModel.setAttribute('visible', false);

    let ver = parseInt(boxId.split("-")[1]);
    let boxJson = {
      '@type': 'a-entity',
      '@id': boxId,
      '@version': ver,
      '@name': `/root/${boxId}`,
      '@children': {},
    };
    let patchJson = {
      'op': 'remove',
      'value': boxJson,
      '@name': `/root/${boxId}`,
      '@version': ver,
    };

    aincraft_ts.produce(JSON.stringify(patchJson)).then(() => {
      console.log("Box size updated successfully.");
    }).catch((error) => {
      console.error("Error updating box size:", error);
    });
  }
}



function testAndAddModelToCache(modelName, blobUrl) {
  if (!(modelName in modelCache)) {
    // 如果modelName不存在于缓存中，添加到缓存
    addModelToCache(modelName, blobUrl);
    console.log(`Added new model for namespace "${modelName}".`);
  } else {
    console.log(`Model for namespace "${modelName}" already exists in the cache.`);
  }
}


function objectNameExtraction(str, n) {
  return new Promise((resolve, reject) => {
    let nameStr = str;
    try {
      for (let i = 0; i < n; i++) {
        const lastDashIndex = nameStr.lastIndexOf('/');
        if (lastDashIndex === -1) {
          // No more slashes to remove, break the loop.
          break;
        }
        nameStr = nameStr.substring(0, lastDashIndex);
      }
      resolve(nameStr);
    } catch (error) {
      reject(error);
    }
  });
}

function addNewEntity(blobUrl,pos,objectName,entityID){
  const spawnEl = document.createElement('a-entity');
  spawnEl.setAttribute('gltf-model', `url(${blobUrl})`);
  spawnEl.setAttribute('position', pos);
  testAndAddModelToCache(objectName,blobUrl);
  spawnEl.setAttribute('id', entityID);
  //el.sceneEl.appendChild(spawnEl)
  document.getElementsByTagName('a-scene')[0].appendChild(spawnEl);
}

function addNewEntity_finegrained(blobUrl,pos,objectName,entityID,imagesString,otherAttributesString){
  const spawnEl = document.createElement('a-entity');
  spawnEl.setAttribute('gltf-model', `url(${blobUrl})`);
  spawnEl.setAttribute('position', pos);
  gltfBlob_image = new Blob([imagesString]);
  blobUrl_image = URL.createObjectURL(gltfBlob_image);
  gltfBlob_otherAttributes = new Blob([otherAttributesString]);
  blobUrl_otherAttributes = URL.createObjectURL(gltfBlob_otherAttributes);
  const asteriskIndex = objectName.lastIndexOf("/*");
  const objectName_1 = objectName.substring(0, asteriskIndex + 1) + "1" + objectName.substring(asteriskIndex + 2);
  const objectName_2 = objectName.substring(0, asteriskIndex + 1) + "2" + objectName.substring(asteriskIndex + 2);
  testAndAddModelToCache(objectName_1,blobUrl_image);
  testAndAddModelToCache(objectName_2,blobUrl_otherAttributes);
  spawnEl.setAttribute('id', entityID);
  //el.sceneEl.appendChild(spawnEl)
  document.getElementsByTagName('a-scene')[0].appendChild(spawnEl);

}


//This function is not working
/* function removeNewEntity(entityID){
    let intersectedEl = document.getElementById(entityID);
      intersectedEl.remove();
      const removedEntity = document.getElementById(entityID);
    if (!removedEntity) {
      console.log(`Entity with ID ${entityID} has been removed from the DOM.`);
    } else {
      console.log(`Entity with ID ${entityID} is still in the DOM.`);
    }
} */

function removeNewEntity(entityID) {
  let intersectedEl = document.getElementById(entityID);

  if (intersectedEl) {
    console.log(`Entity with ID ${entityID} found. Attempting to remove.`);
    try {
      intersectedEl.remove();
      console.log(`Entity with ID ${entityID} removed.`);
    } catch (error) {
      console.error(`Error removing entity with ID ${entityID}:`, error);
    }

    const removedEntity = document.getElementById(entityID);
    if (!removedEntity) {
      console.log(`Entity with ID ${entityID} has been removed from the DOM.`);
    } else {
      console.log(`Entity with ID ${entityID} is still in the DOM.`);
    }
  } else {
    console.log(`Entity with ID ${entityID} not found.`);
  }
}
    
