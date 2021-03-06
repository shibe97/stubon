import { expect } from 'chai';
import Stubon, { privates } from '../src/stubon';

describe('src/stubon.js privates.getParams', () => {
    const dummyRequestObject = {
        method : '',
        query  : 'query',
        body   : 'body',
    };
    const dataProvider = {
        'getting from query: called by method "GET"' : {
            method   : 'GET',
            expected : 'query',
        },
        'getting from body: called by methods excepting "GET"' : {
            method   : 'POST',
            expected : 'body',
        },
    };

    Object.keys(dataProvider).forEach(description => {
        const data = dataProvider[description];
        it(description, () => {
            dummyRequestObject.method = data.method;
            const actual = privates.getParams(dummyRequestObject);
            expect(actual).to.equal(data.expected);
        });
    });
});

describe('src/stubon.js privates.isSubsetObject', () => {
    const whole = {
        test1 : 1,
        test2 : 2,
    };
    const dataProvider = {
        'true  : whole = part' : {
            part     : whole,
            expected : true,
        },
        'true  : whole ⊇ part' : {
            part : {
                test1 : 1,
            },
            expected : true,
        },
        'false : whole ⊋ part' : {
            part : {
                test1 : 0,
            },
            expected : false,
        },
        'false : whole ⊆ part' : {
            part : {
                test1 : 1,
                test2 : 2,
                test3 : 3,
            },
            expected : false,
        },
        'false : whole ∩ part = ∅' : {
            part : {
                test3 : 3,
                test4 : 4,
            },
            expected : false,
        },
    };

    Object.keys(dataProvider).forEach(description => {
        const data = dataProvider[description];
        it(description, () => {
            const actual = privates.isSubsetObject(whole, data.part);
            expect(actual).to.equal(data.expected);
        });
    });
});

describe('src/stubon.js privates.isPlaceholder', () => {
    const dataProvider = {
        'true  : "{hoge}"' : {
            str      : '{hoge}',
            expected : true,
        },
        'false : "hoge"' : {
            str      : 'hoge',
            expected : false,
        },
    };

    Object.keys(dataProvider).forEach(description => {
        const data = dataProvider[description];
        it(description, () => {
            const actual = privates.isPlaceholder(data.str);
            expect(actual).to.equal(data.expected);
        });
    });
});

describe('src/stubon.js privates.isMatchingPathAndExtractParams', () => {
    const dataProvider = {
        'matching.' : {
            stubPath : '/hoge/fuga/get',
            reqPath  : '/hoge/fuga/get',
            expected : {
                isMatch   : true,
                reqParams : {},
            },
        },
        'matching with a routing parameter.' : {
            stubPath : '/hoge/{id}/get',
            reqPath  : '/hoge/1000/get',
            expected : {
                isMatch   : true,
                reqParams : {
                    id : '1000',
                },
            },
        },
        'matching with routing paramters.' : {
            stubPath : '/{lang}/hoge/{hogeId}/fuga/{fugaId}/get',
            reqPath  : '/ja/hoge/1000/fuga/2000/get',
            expected : {
                isMatch   : true,
                reqParams : {
                    lang   : 'ja',
                    hogeId : '1000',
                    fugaId : '2000',
                },
            },
        },
        'no matching by a difference in directory hierarchies.' : {
            stubPath : '/hoge/fuga/get',
            reqPath  : '/hoge/get',
            expected : {
                isMatch   : false,
                reqParams : {},
            },
        },
        'no matching by a difference in directories.' : {
            stubPath : '/hoge/fuga/get',
            reqPath  : '/hoge/piyo/get',
            expected : {
                isMatch   : false,
                reqParams : {},
            },
        },
        'no matching by a differenc in a end of path.' : {
            stubPath : '/hoge/{id}/get',
            reqPath  : '/hoge/1000/post',
            expected : {
                isMatch   : false,
                reqParams : {},
            },
        },
    };

    Object.keys(dataProvider).forEach(description => {
        const data = dataProvider[description];
        it(description, () => {
            const [isMatch, reqParams] =
                privates.isMatchingPathAndExtractParams(data.stubPath, data.reqPath);
            expect(isMatch).to.equal(data.expected.isMatch);
            expect(reqParams).to.eql(data.expected.reqParams);
        });
    });
});

describe('src/stubon.js privates.loadFiles', () => {
    const dataProvider = {
        'load files' : {
            dir      : './test/stub/',
            expected : {
                "./test/stub/data.json": {
                    "/bbb/get/{id}": [
                        {
                            "request": {
                                "method": "GET"
                            },
                            "response": {
                                "body": {
                                    "result": "OK!"
                                },
                                "status": 200
                            }
                        }
                    ]
                },
                "./test/stub/data.yml": {
                    "/aaa/get/{id}": [
                        {
                            "request": {
                                "method": "GET",
                            },
                            "response": {
                                "body": {
                                    "result": "OK!",
                                },
                                "status": 200
                            }
                        }
                    ],
                },
            },
        },
    };

    Object.keys(dataProvider).forEach(description => {
        const data = dataProvider[description];
        it(description, () => {
            const actual = privates.loadFiles(data.dir);
            expect(actual).to.eql(data.expected);
        });
    });
});
