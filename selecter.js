function getSelectionText (target) {
    var windowSelection = window.getSelection();
    var selectedText = windowSelection.getRangeAt(0).toString(),
        rawText = target.text(),
        startIndex = windowSelection.anchorOffset,
        endIndex = windowSelection.focusOffset,
        startIndexOf = rawText.indexOf(selectedText),
        endIndexOf = startIndexOf + selectedText.length,
        indexArray = target.data('indexs');
    if (startIndex > endIndex) {
        var tempStartIndex = startIndex;
        startIndex = endIndex;
        endIndex = tempStartIndex;
    }
    if(startIndexOf === -1 || selectedText === ""){
        return;
    }

    var index, startIndexTest = 0, indices = [];
    while ((index = rawText.indexOf(selectedText, startIndexTest)) > -1) {
        indices.push(index);
        startIndexTest = index + 1;
    }
    var i, j;
    if (indices.length > 1) {
        var endIndexArray = _.pluck(indexArray, 'endIndex'),
            matchFound = false;
        for (i = 0; i < indices.length; i++) {
            if(matchFound) {
                break;
            }
            for(j = 0; j < endIndexArray.length; j++) {
                if(parseInt(indices[i], 10) !== parseInt(endIndexArray[j], 10) + startIndex) {
                    continue;
                }
                startIndex = parseInt(indices[i], 10);
                endIndex = parseInt(indices[i], 10) + selectedText.length;
                matchFound = true;
            }
        }
        if (startIndex < startIndexOf) {
            startIndex = startIndexOf;
            endIndex = endIndexOf;
        }
    }
    else {
        startIndex = startIndexOf;
        endIndex = endIndexOf;
    }

    return ({
        rawText: rawText,
        selectedText: selectedText,
        startIndex: startIndex,
        endIndex: endIndex
    });
}

function setHighlightedMatch (selectionTextObj, target) {
    var indexArray = target.data('indexs') || [];
    var selectIndexs = {'startIndex':selectionTextObj.startIndex,'endIndex':selectionTextObj.endIndex};
    indexArray.push(selectIndexs);
    target.data('indexs',indexArray);
    renderHightlightText(selectionTextObj, target, indexArray);
}

function renderHightlightText (selectionTextObj, target, indexArray) {
    indexArray = _.sortBy(indexArray, 'startIndex');
    var lastEndIndex = 0;
    var html = '';
    for (var i = 0;i < indexArray.length ;i++ ){
        var last = selectionTextObj.rawText.substring(lastEndIndex,indexArray[i].startIndex);
        var current = selectionTextObj.rawText.substring(indexArray[i].startIndex,indexArray[i].endIndex);
        var current = '<span class="highlighted-match">' + current + '</span>';
        if (indexArray.length-1 == i) {
            var next = selectionTextObj.rawText.substring(indexArray[i].endIndex);
        }else {
            var next = '';
        }
        
        html += last + current + next;
        lastEndIndex = indexArray[i].endIndex;
    }
    target.html(html);
}

function verifySelectField (selectionTextObj, target){
    /*
        选择状态:
        0       正确
        1       所选在已选之内
        2       所选完全覆盖已有的
        3       所选择的覆盖已有的,开头在外(left)，结尾在内
        4       所选择的覆盖已有的,开头在内，结尾在外(right)
        5       所选择的覆盖已有的,结尾在内，开始在外(left)
        6       所选择的覆盖已有的,结尾在内，开始在外
    */
    var selectedState = 0;

    var indexArray = target.data('indexs') || [];
    if (indexArray.length == 0){
        return selectedState;
    }

    for (var i = 0;i< indexArray.length;i++ ){
        if (selectionTextObj.startIndex >= indexArray[i].startIndex 
        && selectionTextObj.endIndex <= indexArray[i].endIndex) {
            selectedState = 1;
            break;
        }

        if (selectionTextObj.startIndex < indexArray[i].startIndex 
        && selectionTextObj.endIndex > indexArray[i].endIndex) {
            selectedState = 2;
            break;
        }
        
        if (selectionTextObj.startIndex < indexArray[i].startIndex 
        && (selectionTextObj.endIndex >= selectionTextObj.startIndex 
        && selectionTextObj.endIndex <= indexArray[i].endIndex)) {
            selectedState = 3;
            break;
        }
        
        if ((selectionTextObj.startIndex >= selectionTextObj.startIndex 
        && selectionTextObj.startIndex <= indexArray[i].endIndex) 
        && selectionTextObj.endIndex > indexArray[i].endIndex) {
            selectedState = 4;
            break;
        }

        if ((selectionTextObj.endIndex >= indexArray[i].startIndex 
        && selectionTextObj.endIndex <= indexArray[i].endIndex) 
        && selectionTextObj.startIndex < indexArray[i].startIndex) {
            selectedState = 5;
            break;
        }

        if ((selectionTextObj.startIndex >= indexArray[i].startIndex 
        && selectionTextObj.startIndex <= indexArray[i].endIndex) 
        && selectionTextObj.endIndex > indexArray[i].endIndex) {
            selectedState = 6;
            break;
        }
    }
    return selectedState;
}

window.onmouseup = function(){
  var target = $('#select-content');
    var selectionText = getSelectionText(target);
    if (!!selectionText){
        var selectedState = verifySelectField(selectionText, target);
        document.getElementById("select_json").innerHTML = JSON.stringify(selectionText);
        document.getElementById("select_state").innerHTML = selectedState;
        if (selectedState == 0) {
            setHighlightedMatch(selectionText, target);
        }
    } 
}